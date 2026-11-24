import os
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import NullPool, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# These defaults let settings load when importing the application. Tests should
# still provide TEST_DATABASE_URL explicitly and use a disposable PostgreSQL DB.
os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://unused:unused@localhost/unused"
)
os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-do-not-use-in-production")

from main import app  # noqa: E402
from src.auth.refresh_sessions.models import RefreshSession  # noqa: F401, E402
from src.comments.models import Comment  # noqa: F401, E402
from src.database.base import Base  # noqa: E402
from src.database.dependencies import get_db  # noqa: E402
from src.posts.models import Post  # noqa: F401, E402
from src.users.models import User  # noqa: F401, E402


@pytest_asyncio.fixture
async def test_engine():
    database_url = os.getenv("TEST_DATABASE_URL")
    if not database_url:
        pytest.skip("Set TEST_DATABASE_URL to a disposable PostgreSQL test database")

    engine = create_async_engine(database_url, poolclass=NullPool, pool_pre_ping=True)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncIterator[AsyncSession]:
    # Each test gets a clean database even though application services commit.
    async with test_engine.begin() as connection:
        await connection.execute(
            text(
                "TRUNCATE TABLE comments, posts, refresh_sessions, users "
                "RESTART IDENTITY CASCADE"
            )
        )

    session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        transport = ASGITransport(app=app)

        async with AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def registered_user(client):
    response = await client.post(
        "/api/v1/users",
        json={
            "display_name": "Test User",
            "username": "test_user",
            "email": "test@example.com",
            "password": "correct-horse-battery-staple",
        },
    )
    assert response.status_code == 201, response.text
    payload = response.json()
    return {
        "id": payload["user_data"]["id"],
        "access_token": payload["token"]["access_token"],
    }


async def register_another_user(client, suffix: str = "second"):
    response = await client.post(
        "/api/v1/users",
        json={
            "display_name": "Another User",
            "username": f"user_{suffix}",
            "email": f"{suffix}@example.com",
            "password": "another-correct-password",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()
