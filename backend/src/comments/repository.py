from sqlalchemy import select
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
