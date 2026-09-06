import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.service import AuthService
from src.core.config import settings
from src.core.exceptions import UnauthorizedError
from src.database.dependencies import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


async def get_current_user_id(
    token: str = Depends(oauth2_scheme),
) -> int:

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.InvalidTokenError:
        raise UnauthorizedError()

    if payload.get("type") != "access":
        raise UnauthorizedError()

    user_id = payload.get("sub")

    if user_id is None:
        raise UnauthorizedError()

    return int(user_id)


async def get_auth_service(db: AsyncSession = Depends(get_db)):
    return AuthService(db)
