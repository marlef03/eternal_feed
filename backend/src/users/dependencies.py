from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.database.dependencies import get_db
from src.users.service import UserService
from src.users.models import User

from src.auth.dependencies import get_current_user_id


async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> User:
    
    user = await UserService(db).get_user_or_raise(user_id)
    
    return user


async def get_user_service(
    db: AsyncSession = Depends(get_db)
):
    return UserService(db)
