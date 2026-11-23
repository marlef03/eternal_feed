import os

from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from src.database.base import Base

# Import models to include them in Base.metadata
from src.users.models import User
from src.posts.models import Post
from src.comments.models import Comment
from src.auth.refresh_sessions.models import RefreshSession


DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise Exception('DATABASE_URL environment variable is not set')

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = DATABASE_URL

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    configuration = config.get_section(
        config.config_ini_section,
    )

    if configuration is None:
        raise Exception('failed to create async migrations configuration')

    configuration["sqlalchemy.url"] = DATABASE_URL

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as conn:
        await conn.run_sync(
            do_run_migrations,
        )

    await connectable.dispose()


def run_migrations_online() -> None:
    import asyncio

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
