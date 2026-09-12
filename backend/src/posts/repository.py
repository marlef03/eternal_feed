from datetime import datetime

from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.posts.models import Post

from src.users.models import User

from src.core.config import settings


class PostRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, post_id: int) -> Post | None:
        result = await self.session.execute(select(Post).where(Post.id == post_id))

        return result.scalar_one_or_none()
    
    async def get_by_id_with_author(self, post_id: int) -> tuple[Post, User] | None:
        result = await self.session.execute(
            select(Post, User)
            .join(Post.author)
            .where(Post.id == post_id)
        )

        return result.tuples().one_or_none()

    async def get_before(
        self,
        timestamp: datetime,
        id: int,
    ) -> list[Post] | None:
        
        result = await self.session.execute(
            select(Post)
            .where(
                or_(
                    Post.created_at < timestamp,
                    and_(Post.created_at == timestamp, Post.id < id),
                )
            )
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_per_update)
        )

        return result.scalars().all()
    
    async def get_before_with_author(
        self,
        timestamp: datetime,
        id: int,
    ) -> list[tuple[Post, User]] | None:
        
        result = await self.session.execute(
            select(Post, User)
            .join(Post.author)
            .where(
                or_(
                    Post.created_at < timestamp,
                    and_(Post.created_at == timestamp, Post.id < id),
                )
            )
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_per_update)
        )

        return result.tuples().all()

    async def get_latest(self) -> list[Post] | None:
        result = await self.session.execute(
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_preload)
        )

        return result.scalars().all()
    
    async def get_latest_with_author(self) -> list[tuple[Post, User]] | None:
        result = await self.session.execute(
            select(Post, User)
            .join(Post.author)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_preload)
        )

        return result.tuples().all()

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
