from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.database.dependencies import get_db

from src.comments.service import CommentService


async def get_comment_service(
    db: AsyncSession = Depends(get_db)
):
    return CommentService(db)
