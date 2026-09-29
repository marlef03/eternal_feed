from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.comments.service import CommentService
from src.database.dependencies import get_db


async def get_comment_service(db: AsyncSession = Depends(get_db)):
    return CommentService(db)
