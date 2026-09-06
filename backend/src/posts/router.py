from fastapi import APIRouter, Depends, status

from src.posts.schemas import PostCreate, PostResponse
from src.posts.service import PostService
from src.posts.dependencies import get_post_service

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
)


@router.post(
    "/",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_post(
    data: PostCreate,
    service: PostService = Depends(get_post_service),
):
    author_id = 2  # TODO: replace with auth

    return await service.create_post(
        data=data,
        author_id=author_id,
    )


@router.get(
    "/{post_id}",
    response_model=PostResponse,
)
async def get_post(
    post_id: int,
    service: PostService = Depends(get_post_service),
):
    return await service.get_post_or_raise(post_id)


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_post(
    post_id: int, 
    service: PostService = Depends(get_post_service)
):
    await service.delete_post(post_id)
