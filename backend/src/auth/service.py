from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.refresh_sessions.repository import RefreshSessionRepository
from src.core.config import settings
from src.core.exceptions import (
    InvalidCredentialsError,
    UnauthorizedError,
)
from src.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_password,
)
from src.users.repository import UserRepository


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repository = UserRepository(session)
        self.refresh_session_repository = RefreshSessionRepository(session)

    async def login_via_email(
        self,
        email: str,
        password: str,
    ) -> tuple[str, str]:

        user = await self.user_repository.get_by_email(email)

        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()

        return await self.__login(user.id)

    async def login_via_username(
        self,
        username: str,
        password: str,
    ) -> tuple[str, str]:

        user = await self.user_repository.get_by_username(username)

        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()

        return await self.__login(user.id)

    async def __login(
        self,
        user_id: int,
    ) -> tuple[str, str]:

        created_at = datetime.now(UTC)

        expires_at = created_at + timedelta(days=settings.refresh_token_expire_days)

        access_token, refresh_token = await self.__create_tokens(
            user_id,
            created_at,
            expires_at,
        )

        await self.session.commit()

        return access_token, refresh_token

    async def refresh(
        self,
        token: str,
    ) -> tuple[str, str]:

        token_hash = hash_refresh_token(token)

        refresh_session = await self.refresh_session_repository.get_by_token_hash(
            token_hash
        )

        if refresh_session is None:
            raise UnauthorizedError()

        now = datetime.now(UTC)

        revoked = await self.refresh_session_repository.revoke(refresh_session.id, now)

        if not revoked:
            raise UnauthorizedError()

        access_token, refresh_token = await self.__create_tokens(
            refresh_session.user_id,
            datetime.now(UTC),
            refresh_session.expires_at,
        )

        await self.session.commit()

        return access_token, refresh_token

    async def logout(
        self,
        token: str,
    ) -> None:

        token_hash = hash_refresh_token(token)

        refresh_session = await self.refresh_session_repository.get_by_token_hash(
            token_hash
        )

        if refresh_session is None:
            return

        now = datetime.now(UTC)

        revoked = await self.refresh_session_repository.revoke(refresh_session.id, now)

        if not revoked:
            raise UnauthorizedError()

        await self.session.commit()

    async def __create_tokens(
        self,
        user_id: int,
        created_at: datetime,
        expires_at: datetime,
    ) -> tuple[str, str]:

        return (
            create_access_token(user_id),
            await self.__create_refresh_token(
                user_id,
                created_at,
                expires_at,
            ),
        )

    async def __create_refresh_token(
        self,
        user_id: int,
        created_at: datetime,
        expires_at: datetime,
    ) -> str:

        refresh_token = create_refresh_token()

        refresh_token_hash = hash_refresh_token(refresh_token)

        await self.refresh_session_repository.create(
            user_id=user_id,
            token_hash=refresh_token_hash,
            created_at=created_at,
            expires_at=expires_at,
        )

        return refresh_token
