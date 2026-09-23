from fastapi import APIRouter, Depends, status

from src.users.schemas import UserCreate, UserResponse
from src.users.service import UserService
from src.users.models import User
from src.users.dependencies import get_current_user, get_user_service

from src.core.exceptions import UsernameIsTakenError, EmailIsTakenError

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service),
):
    return await service.create_user(data)


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    user: User = Depends(get_current_user),
):
    return user


@router.get(
    "/exists",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def does_exist(
    username: str = None,
    email: str = None,
    service: UserService = Depends(get_user_service),
):
    if username is not None and await service.get_user_by_username(username) is not None:
        raise UsernameIsTakenError()

    if email is not None and await service.get_user_by_email(email) is not None:
        raise EmailIsTakenError()


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    return await service.get_user_or_raise(user_id)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    await service.delete_user(user_id)
