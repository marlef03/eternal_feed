from collections.abc import Sequence
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from src.comments.models import Comment
from src.comments.repository import CommentRepository
from src.comments.schemas import CommentCreate
from src.core.config import settings
from src.core.exceptions import CommentNotFoundError, WrongUserError


class CommentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = CommentRepository(session)

    async def create_comment(
        self,
        data: CommentCreate,
        author_id: int,
        post_id: int,
    ) -> Comment:
        comment = await self.repository.create(
            content=data.content,
            author_id=author_id,
            post_id=post_id,
        )

        await self.session.commit()

        await self.session.refresh(comment)

        return comment

    async def get_comment(
        self,
        comment_id: int,
    ) -> Comment | None:
        return await self.repository.get_by_id(comment_id)

    async def get_comment_or_raise(
        self,
        comment_id: int,
    ) -> Comment:
        comment = await self.repository.get_by_id(comment_id)

        if comment is None:
            raise CommentNotFoundError()

        return comment

    async def get_comment_with_author(
        self,
        comment_id: int,
    ) -> Comment | None:
        return await self.repository.get_by_id_with_author(comment_id)

    async def get_comment_with_author_or_raise(
        self,
        comment_id: int,
    ) -> Comment:
        result = await self.repository.get_by_id_with_author(comment_id)

        if result is None:
            raise CommentNotFoundError()

        return result

    async def get_post_comments(
        self,
        post_id: int,
        before_timestamp: datetime | None,
        before_id: int | None,
    ) -> tuple[Sequence[Comment], bool]:
        if before_timestamp is None or before_id is None:
            limit = settings.comments_preloaded
            result = await self.repository.get_latest(post_id, limit + 1)
        else:
            limit = settings.comments_per_update
            result = await self.repository.get_before(
                post_id,
                before_timestamp,
                before_id,
                limit + 1,
            )

        return result[:limit], len(result) > limit

    async def get_post_comments_with_author(
        self,
        post_id: int,
        before_timestamp: datetime | None,
        before_id: int | None,
    ) -> tuple[Sequence[Comment], bool]:
        if before_timestamp is None or before_id is None:
            limit = settings.comments_preloaded
            result = await self.repository.get_latest_with_author(post_id, limit + 1)
        else:
            limit = settings.comments_per_update
            result = await self.repository.get_before_with_author(
                post_id,
                before_timestamp,
                before_id,
                limit + 1,
            )

        return result[:limit], len(result) > limit

    async def delete_comment(
        self,
        comment_id: int,
        current_user_id: int,
    ) -> None:
        comment = await self.get_comment_or_raise(comment_id)

        if comment.author_id != current_user_id:
            raise WrongUserError()

        await self.repository.delete(comment)

        await self.session.commit()
