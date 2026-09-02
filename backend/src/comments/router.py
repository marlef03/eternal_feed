from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.dependencies import get_db
from src.comments.service import CommentService
from src.comments.schemas import CommentCreate, CommentResponse

from src.core.exceptions import CommentNotFoundError


router = APIRouter(tags=['comments'])


@router.post(
  '/posts/{post_id}/comments',
  response_model=CommentResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_comment(
  post_id: int,
  data: CommentCreate,
  db: AsyncSession = Depends(get_db),
):
  
  service = CommentService(db)

  author_id = 2 # TODO: replace with auth

  return await service.create_comment(
    data=data,
    author_id=author_id,
    post_id=post_id,
  )


@router.get(
  '/comments/{comment_id}',
  response_model=CommentResponse,
)
async def get_comment(
  comment_id: int,
  db: AsyncSession = Depends(get_db),
):
  
  service = CommentService(db)

  try:
    return await service.get_comment_or_raise(comment_id)
  except CommentNotFoundError:
    raise HTTPException(
      status_code=404,
      detail='Comment not found',
    )


@router.delete(
  '/comments/{comment_id}',
  status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_comment(
  comment_id: int,
  db: AsyncSession = Depends(get_db),
):
  
  service = CommentService(db)

  try:
    await service.delete_comment(comment_id)
  except CommentNotFoundError:
    raise HTTPException(
      status_code=404,
      detail='Comment not found',
    )
