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

    async def get_portion_after(
        self,
        last_timestamp: datetime,
        last_id: int,
    ) -> list[Post] | None:
        
        result = await self.session.execute(
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_per_update)
            .where(
                or_(
                    Post.created_at < last_timestamp,
                    and_(Post.created_at == last_timestamp, Post.id < last_id),
                )
            )
        )

        return result.scalars().all()
    
    async def get_portion_before(
        self,
        first_timestamp: datetime,
        first_id: int,
    ) -> list[Post] | None:
        
        subquery = (
            select(Post)
            .where(
                or_(
                    Post.created_at > first_timestamp,
                    and_(Post.created_at == first_timestamp, Post.id > first_id),
                )
            )
            .order_by(Post.created_at, Post.id)
            .limit(settings.posts_per_update)
            .subquery()
        )

        result = await self.session.execute(
            select(Post)
            .from_statement(
                select(subquery)
                .order_by(subquery.c.created_at.desc(), subquery.c.id.desc())
            )
            
        )

        return result.scalars().all()

    async def get_portion_between(
        self,
        first_timestamp: datetime,
        first_id: int,
        last_timestamp: datetime,
        last_id: int,
    ) -> list[Post] | None:
        
        result = await self.session.execute(
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .where(
                and_(
                    or_(
                        Post.created_at < first_timestamp,
                        and_(
                            Post.created_at == first_timestamp, 
                            Post.id <= first_id
                        ),
                    ),
                    or_(
                        Post.created_at > last_timestamp,
                        and_(
                            Post.created_at == last_timestamp, 
                            Post.id >= last_id
                        ),
                    )
                )
            )
        )

        return result.scalars().all()

    async def get_portion_of_first(self) -> list[Post] | None:
        result = await self.session.execute(
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_window_scale)
        )

        return result.scalars().all()

    async def get_portion_up_to(
        self,
        last_timestamp: datetime,
        last_id: int,
    ) -> list[Post] | None:
        
        result = await self.session.execute(
            select(Post)
            .where(
                or_(
                    Post.created_at > last_timestamp,
                    and_(Post.created_at == last_timestamp, Post.id >= last_id),
                )
            )
            .order_by(Post.created_at.desc(), Post.id.desc())
        )

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
