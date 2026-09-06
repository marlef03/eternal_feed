from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    author_id: int
    post_id: int
    created_at: datetime
