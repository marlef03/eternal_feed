from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.posts.models import Post


class PostRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, post_id: int) -> Post | None:
        result = await self.session.execute(select(Post).where(Post.id == post_id))

        return result.scalar_one_or_none()

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
