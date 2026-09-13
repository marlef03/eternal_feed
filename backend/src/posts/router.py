from datetime import datetime

from fastapi import APIRouter, Depends, status

from src.posts.schemas import PostCreate, PostResponse, PostWithAuthorResponse
from src.posts.service import PostService
from src.posts.dependencies import get_post_service

from src.auth.dependencies import get_current_user_id

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
)


@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_post(
    data: PostCreate,
    service: PostService = Depends(get_post_service),
    current_user_id: int = Depends(get_current_user_id),
):
    return await service.create_post(
        data=data,
        author_id=current_user_id,
    )


@router.get(
    "",
    response_model=list[PostWithAuthorResponse],
)
async def get_posts(
    before_timestamp: datetime | None = None,
    before_id: int | None = None,
    service: PostService = Depends(get_post_service),
):
    result = await service.get_posts_with_author(
        before_timestamp,
        before_id,
    )

    return result


@router.get(
    "/{post_id}",
    response_model=PostWithAuthorResponse,
)
async def get_post(
    post_id: int,
    service: PostService = Depends(get_post_service),
):
    return await service.get_post_with_author_or_raise(post_id)


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_post(
    post_id: int,
    service: PostService = Depends(get_post_service),
    current_user_id: int = Depends(get_current_user_id),
):
    await service.delete_post(post_id, current_user_id)
