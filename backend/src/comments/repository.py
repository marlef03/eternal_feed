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

    async def get_portion_after(
        self,
        last_timestamp: datetime,
        last_id: int,
    ) -> list[Comment] | None:
        
        result = await self.session.execute(
            select(Comment)
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(settings.comments_per_update)
            .where(
                or_(
                    Comment.created_at < last_timestamp,
                    and_(Comment.created_at == last_timestamp, Comment.id < last_id),
                )
            )
        )

        return result.scalars().all()
    
    async def get_portion_of_first(self) -> list[Comment] | None:
        result = await self.session.execute(
            select(Comment)
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(settings.comments_preloaded)
        )

        return result.scalars().all()
    
    async def get_portion_up_to(
        self,
        last_timestamp: datetime,
        last_id: int,
    ) -> list[Comment] | None:
        
        result = await self.session.execute(
            select(Comment)
            .where(
                or_(
                    Comment.created_at > last_timestamp,
                    and_(Comment.created_at == last_timestamp, Comment.id >= last_id),
                )
            )
            .order_by(Comment.created_at.desc(), Comment.id.desc())
        )

        return result.scalars().all()

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
