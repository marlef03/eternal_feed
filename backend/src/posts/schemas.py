from datetime import datetime

from pydantic import BaseModel, ConfigDict

from src.users.schemas import UserPublicResponse


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
