from typing import Annotated

from datetime import datetime

from pydantic import BaseModel, ConfigDict, BeforeValidator

from src.users.schemas import UserPublicResponse

from src.comments.schemas import CommentsResponse

from src.core.config import settings


class PostCreate(BaseModel):
    title: str
    content: str


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    created_at: datetime


class PostWithAuthorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    created_at: datetime
    author: UserPublicResponse


def _format_comments(v):
    items = list(v)

    return {
        "items": items[:settings.comments_preloaded], 
        "has_more": len(items) > (settings.comments_preloaded),
    }


class PostWithCommentsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    created_at: datetime
    author: UserPublicResponse
    comments: Annotated[CommentsResponse, BeforeValidator(_format_comments)]
