from sqlalchemy.ext.asyncio import AsyncSession

from src.comments.models import Comment
from src.comments.repository import CommentRepository
from src.comments.schemas import CommentCreate
from src.core.exceptions import CommentNotFoundError

from src.core.exceptions import WrongUserError


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
