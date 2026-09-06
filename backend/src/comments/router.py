from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.comments.schemas import CommentCreate, CommentResponse
from src.comments.service import CommentService
from src.comments.dependencies import get_comment_service
from src.database.dependencies import get_db

router = APIRouter(tags=["comments"])


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
    post_id: int,
    data: CommentCreate,
    service: CommentService = Depends(get_comment_service),
):
    author_id = 2  # TODO: replace with auth

    return await service.create_comment(
        data=data,
        author_id=author_id,
        post_id=post_id,
    )


@router.get(
    "/comments/{comment_id}",
    response_model=CommentResponse,
)
async def get_comment(
    comment_id: int,
    service: CommentService = Depends(get_comment_service),
):
    return await service.get_comment_or_raise(comment_id)


@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_comment(
    comment_id: int,
    service: CommentService = Depends(get_comment_service),
):
    await service.delete_comment(comment_id)
