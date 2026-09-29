from fastapi import APIRouter, Depends, Response, status

from src.auth.dependencies import get_auth_service
from src.auth.schemas import TokenResponse
from src.auth.service import AuthService
from src.core.config import settings
from src.core.exceptions import EmailIsTakenError, UsernameIsTakenError
from src.users.dependencies import get_current_user, get_user_service
from src.users.models import User
from src.users.schemas import NewUserResponse, UserCreate, UserResponse
from src.users.service import UserService

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post(
    "",
    response_model=NewUserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    data: UserCreate,
    response: Response,
    userService: UserService = Depends(get_user_service),
    authService: AuthService = Depends(get_auth_service),
):
    user = await userService.create_user(data)

    access_token, refresh_token = await authService.login(user.id)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return NewUserResponse(
        user_data=user,
        token=TokenResponse(
            access_token=access_token,
        ),
    )


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
    username: str | None = None,
    email: str | None = None,
    service: UserService = Depends(get_user_service),
):
    if (
        username is not None
        and await service.get_user_by_username(username) is not None
    ):
        raise UsernameIsTakenError()

    if email is not None and await service.get_user_by_email(email) is not None:
        raise EmailIsTakenError()


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
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
