from collections.abc import Sequence
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import PostNotFoundError, WrongUserError
from src.posts.models import Post
from src.posts.repository import PostRepository
from src.posts.schemas import PostCreate


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

    async def get_post_with_author(
        self,
        post_id: int,
    ) -> Post | None:
        return await self.repository.get_by_id_with_author(post_id)

    async def get_post_or_raise(
        self,
        post_id: int,
    ) -> Post:
        post = await self.repository.get_by_id(post_id)

        if post is None:
            raise PostNotFoundError()

        return post

    async def get_post_with_author_or_raise(
        self,
        post_id: int,
    ) -> Post:
        result = await self.repository.get_by_id_with_author(post_id)

        if result is None:
            raise PostNotFoundError()

        return result

    async def get_posts(
        self,
        before_timestamp: datetime | None,
        before_id: int | None,
    ) -> Sequence[Post]:
        if before_timestamp is None or before_id is None:
            return await self.repository.get_latest()

        return await self.repository.get_before(
            before_timestamp,
            before_id,
        )

    async def get_posts_with_author(
        self,
        before_timestamp: datetime | None,
        before_id: int | None,
    ) -> Sequence[Post]:
        if before_timestamp is None or before_id is None:
            return await self.repository.get_latest_with_author()

        return await self.repository.get_before_with_author(
            before_timestamp,
            before_id,
        )

    async def get_posts_with_comments(
        self,
        before_timestamp: datetime | None,
        before_id: int | None,
    ) -> Sequence[Post]:
        if before_timestamp is None or before_id is None:
            return await self.repository.get_latest_with_comments()

        return await self.repository.get_before_with_comments(
            before_timestamp,
            before_id,
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
