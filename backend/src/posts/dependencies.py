from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.database.dependencies import get_db

from src.posts.service import PostService


async def get_post_service(
    db: AsyncSession = Depends(get_db)
):
    return PostService(db)
