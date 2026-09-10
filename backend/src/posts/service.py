from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import PostNotFoundError
from src.posts.models import Post
from src.posts.repository import PostRepository
from src.posts.schemas import PostCreate

from src.core.exceptions import WrongUserError


class PostService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = PostRepository(session)

    async def create_post(
        self,
        data: PostCreate,
        author_id: int,
    ) -> Post:

        post = await self.repository.create(
            title=data.title,
            content=data.content,
            author_id=author_id,
        )

        await self.session.commit()

        await self.session.refresh(post)

        return post

    async def get_post(
        self,
        post_id: int,
    ) -> Post | None:

        return await self.repository.get_by_id(post_id)

    async def get_post_or_raise(
        self,
        post_id: int,
    ) -> Post:

        post = await self.repository.get_by_id(post_id)

        if post is None:
            raise PostNotFoundError()

        return post

    async def get_posts(
        self,
        before_timestamp: datetime | None,
        before_id: int | None,
    ) -> list[Post] | None:
        
        if before_timestamp is None:
            return await self.repository.get_latest()

        return await self.repository.get_before(
            before_timestamp,
            before_id,
        )
    
    async def get_posts_between(
        self,
        first_timestamp: datetime,
        first_id: int,
        last_timestamp: datetime,
        last_id: int,
    ) -> list[Post] | None:
        
        return await self.repository.get_portion_between(
            first_timestamp,
            first_id,
            last_timestamp,
            last_id,
        )

    async def delete_post(
        self,
        post_id: int,
        current_user_id: int,
    ) -> None:

        post = await self.get_post_or_raise(post_id)

        if current_user_id != post.author_id:
            raise WrongUserError()

        await self.repository.delete(post)

        await self.session.commit()
