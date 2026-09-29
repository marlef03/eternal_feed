from collections.abc import Sequence
from datetime import datetime

from fastapi import APIRouter, Depends, status
from redis.asyncio import Redis

from src.auth.dependencies import get_current_user_id
from src.core.config import settings
from src.events.dependencies import get_redis
from src.posts.dependencies import get_post_service
from src.posts.schemas import (
    PostCreate,
    PostWithAuthorResponse,
    PostWithCommentsResponse,
)
from src.posts.service import PostService
from src.users.dependencies import get_current_user
from src.users.models import User

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_post(
    data: PostCreate,
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis),
):
    post = await service.create_post(
        data=data,
        author_id=current_user.id,
    )

    post.author = current_user

    await redis.xadd(
        settings.sse_stream_key,
        {
            "event": "post_created",
            "data": PostWithAuthorResponse.model_validate(post).model_dump_json(),
        },
        maxlen=settings.sse_maxlen,
        approximate=True,
    )


@router.get(
    "",
    response_model=Sequence[PostWithCommentsResponse],
)
async def get_posts(
    before_timestamp: datetime | None = None,
    before_id: int | None = None,
    service: PostService = Depends(get_post_service),
):
    result = await service.get_posts_with_comments(
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
