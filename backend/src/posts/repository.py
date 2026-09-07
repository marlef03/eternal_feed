from datetime import datetime

from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.posts.models import Post

from src.core.config import settings


class PostRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, post_id: int) -> Post | None:
        result = await self.session.execute(select(Post).where(Post.id == post_id))

        return result.scalar_one_or_none()

    async def get_portion(
        self,
        last_timestamp: datetime | None,
        last_id: int | None,
    ) -> list[Post] | None:
        
        query = (
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_per_update)
        )

        if last_timestamp is not None:
            query = query.where(
                or_(
                    Post.created_at < last_timestamp,
                    and_(Post.created_at == last_timestamp, Post.id < last_id),
                )
            )

        result = await self.session.execute(query)

        return result.scalars().all()

    async def create(
        self,
        *,
        title: str,
        content: str,
        author_id: int,
    ) -> Post:

        post = Post(
            title=title,
            content=content,
            author_id=author_id,
        )

        self.session.add(post)

        await self.session.flush()

        return post

    async def delete(self, post: Post) -> None:
        await self.session.delete(post)
