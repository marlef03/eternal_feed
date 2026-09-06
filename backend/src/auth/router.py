from fastapi import APIRouter, Cookie, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from src.auth.dependencies import get_auth_service
from src.auth.schemas import EmailLogin, TokenResponse, UsernameLogin
from src.auth.service import AuthService
from src.core.config import settings
from src.core.exceptions import UnauthorizedError

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post(
    "/login/email",
    response_model=TokenResponse,
)
async def login_via_email(
    data: EmailLogin,
    response: Response,
    service: AuthService = Depends(get_auth_service),
):
    access_token, refresh_token = await service.login_via_email(
        email=data.email,
        password=data.password,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return TokenResponse(access_token=access_token)


@router.post(
    "/login/username",
    response_model=TokenResponse,
)
async def login_via_username(
    data: UsernameLogin,
    response: Response,
    service: AuthService = Depends(get_auth_service),
):
    access_token, refresh_token = await service.login_via_username(
        username=data.username,
        password=data.password,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return TokenResponse(access_token=access_token)


@router.post(
    "/token",
    response_model=TokenResponse,
)
async def token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    access_token, refresh_token = await service.login_via_username(
        username=form_data.username,
        password=form_data.password,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return TokenResponse(access_token=access_token)


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    service: AuthService = Depends(get_auth_service),
):
    if refresh_token is None:
        raise UnauthorizedError()

    access_token, new_refresh_token = await service.refresh(
        refresh_token,
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return TokenResponse(access_token=access_token)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    service: AuthService = Depends(get_auth_service),
):

    if refresh_token is not None:
        await service.logout(refresh_token)

    response.delete_cookie(
        key="refresh_token",
        secure=True,
        httponly=True,
        samesite="lax",
    )
