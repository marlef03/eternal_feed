from fastapi import APIRouter, Depends, status

from src.comments.schemas import CommentCreate, CommentResponse
from src.comments.service import CommentService
from src.comments.dependencies import get_comment_service

from src.auth.dependencies import get_current_user_id

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
    current_user_id: int = Depends(get_current_user_id),
):
    return await service.create_comment(
        data=data,
        author_id=current_user_id,
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
    current_user_id: int = Depends(get_current_user_id),
):
    await service.delete_comment(
        comment_id,
        current_user_id,
    )
