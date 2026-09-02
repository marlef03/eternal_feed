from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession

from src.database.dependencies import get_db
from src.posts.schemas import PostCreate, PostResponse
from src.posts.service import PostService

from src.core.exceptions import PostNotFoundError


router = APIRouter(
  prefix='/posts',
  tags=['posts'],
)


@router.post(
  '/',
  response_model=PostResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_post(
  data: PostCreate,
  db: AsyncSession = Depends(get_db),
):
  
  service = PostService(db)

  author_id = 2 # TODO: replace with auth

  return await service.create_post(
    data=data,
    author_id=author_id,
  )


@router.get(
  '/{post_id}',
  response_model=PostResponse,
)
async def get_post(
  post_id: int,
  db: AsyncSession = Depends(get_db),
):
  
  service = PostService(db)

  try:
    return await service.get_post_or_raise(post_id)
  except PostNotFoundError:
    raise HTTPException(
      status_code=404,
      detail='Post not found',
    )


@router.delete(
  '/{post_id}',
  status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_post(
  post_id: int,
  db: AsyncSession = Depends(get_db)
):
  
  service = PostService(db)

  try:
    await service.delete_post(post_id)
  except PostNotFoundError:
    raise HTTPException(
      status_code=404,
      detail='Post not found',
    )
