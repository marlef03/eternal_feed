from datetime import datetime

from sqlalchemy import select, or_, and_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from src.comments.models import Comment


class CommentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, comment_id: int) -> Comment | None:
        result = await self.session.execute(
            select(Comment).where(Comment.id == comment_id)
        )

        return result.scalar_one_or_none()
    
    async def get_by_id_with_author(self, comment_id: int) -> Comment | None:
        result = await self.session.execute(
            select(Comment)
            .where(Comment.id == comment_id)
            .options(
                joinedload(Comment.author)
            )
        )

        return result.scalar_one_or_none()

    async def get_before(
        self,
        post_id: int,
        timestamp: datetime,
        id: int,
        limit: int,
    ) -> list[Comment] | None:
        
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
            .limit(limit)
        )

        return result.scalars().all()
    
    async def get_before_with_author(
        self,
        post_id: int,
        timestamp: datetime,
        id: int,
        limit: int,
    ) -> list[Comment] | None:
        
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
            .limit(limit)
            .options(
                joinedload(Comment.author)
            )
        )

        return result.scalars().all()
    
    async def get_latest(
        self,
        post_id: int,
        limit: int,
    ) -> list[Comment] | None:
        result = await self.session.execute(
            select(Comment)
            .where(Comment.post_id == post_id)
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(limit)
        )

        return result.scalars().all()
    
    async def get_latest_with_author(
        self,
        post_id: int,
        limit: int,
    ) -> list[Comment] | None:
        result = await self.session.execute(
            select(Comment)
            .where(Comment.post_id == post_id)
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(limit)
            .options(
                joinedload(Comment.author)
            )
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
