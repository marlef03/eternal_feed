from datetime import datetime

from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.comments.models import Comment

from src.core.config import settings


class CommentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, comment_id: int) -> Comment | None:
        result = await self.session.execute(
            select(Comment).where(Comment.id == comment_id)
        )

        return result.scalar_one_or_none()

    async def get_before(
        self,
        post_id: int,
        timestamp: datetime,
        id: int,
    ) -> tuple[list[Comment] | None, bool]:
        
        result = await self.session.execute(
            select(Comment)
            .where(Comment.post_id == post_id)
            .where(
                or_(
                    Comment.created_at < timestamp,
                    and_(Comment.created_at == timestamp, Comment.id < id),
                )
            )
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(settings.comments_per_update + 1)
        )

        data = result.scalars().all()
        has_more = False

        if len(data) == settings.comments_per_update + 1:
            has_more = True

        return (data[:-1] if has_more else data), has_more
    
    async def get_latest(
        self,
        post_id: int,
    ) -> tuple[list[Comment] | None, bool]:
        result = await self.session.execute(
            select(Comment)
            .where(Comment.post_id == post_id)
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(settings.comments_preloaded + 1)
        )

        data = result.scalars().all()
        has_more = False

        if len(data) == settings.comments_preloaded + 1:
            has_more = True

        return (data[:-1] if has_more else data), has_more

    async def create(
        self,
        *,
        content: str,
        author_id: int,
        post_id: int,
    ) -> Comment:

        comment = Comment(
            content=content,
            author_id=author_id,
            post_id=post_id,
        )

        self.session.add(comment)

        await self.session.flush()

        return comment

    async def delete(self, comment: Comment) -> None:
        await self.session.delete(comment)
