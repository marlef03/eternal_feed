from datetime import datetime

from fastapi import APIRouter, Depends, status

from src.comments.schemas import (
    CommentCreate,
    CommentResponse,
    CommentWithAuthorResponse,
    CommentsResponse,
)
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
    "/posts/{post_id}/comments",
    response_model=CommentsResponse,
)
async def get_comments(
    post_id: int,
    before_timestamp: datetime | None = None,
    before_id: int | None = None,
    service: CommentService = Depends(get_comment_service),
):
    comments, has_more = await service.get_post_comments_with_author(
        post_id,
        before_timestamp,
        before_id,
    )

    comments = [{"comment": comment, "author": author} for comment, author in comments]

    return CommentsResponse(
        items=comments,
        has_more=has_more,
    )


@router.get(
    "/comments/{comment_id}",
    response_model=CommentWithAuthorResponse,
)
async def get_comment(
    comment_id: int,
    service: CommentService = Depends(get_comment_service),
):
    comment, author = await service.get_comment_with_author_or_raise(comment_id)

    return {"comment": comment, "author": author}


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
