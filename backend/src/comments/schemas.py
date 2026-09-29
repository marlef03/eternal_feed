from collections.abc import Sequence
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from src.users.schemas import UserPublicResponse


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    created_at: datetime


class CommentWithAuthorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    created_at: datetime
    author: UserPublicResponse


class CommentsResponse(BaseModel):
    items: Sequence[CommentWithAuthorResponse]
    has_more: bool
