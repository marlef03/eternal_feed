from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PostCreate(BaseModel):
    title: str
    content: str


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
