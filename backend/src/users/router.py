from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.dependencies import get_db
from src.users.schemas import UserCreate, UserResponse
from src.users.service import UserService

from src.core.exceptions import UserNotFoundError


router = APIRouter(
  prefix='/users',
  tags=['users'],
)


@router.post(
  '/',
  response_model=UserResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_user(
  data: UserCreate,
  db: AsyncSession = Depends(get_db),
):
  
  service = UserService(db)

  return await service.create_user(data)


@router.get(
  '/{user_id}',
  response_model=UserResponse,
)
async def get_user(
  user_id: int,
  db: AsyncSession = Depends(get_db)
):
  
  service = UserService(db)

  try:
    return await service.get_user_or_raise(user_id)
  except UserNotFoundError:
    raise HTTPException(
      status_code=404,
      detail='User not found',
    )


@router.delete(
  '/{user_id}',
  status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user(
  user_id: int,
  db: AsyncSession = Depends(get_db),
):
  
  service = UserService(db)

  try:
    await service.delete_user(user_id)
  except UserNotFoundError:
    raise HTTPException(
      status_code=404,
      detail='User not found',
    )
