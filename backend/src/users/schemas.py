from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from src.auth.schemas import TokenResponse


class UserCreate(BaseModel):
    display_name: str
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str
    username: str
    email: EmailStr
    created_at: datetime


class UserPublicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str
    username: str
    created_at: datetime


class NewUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_data: UserResponse
    token: TokenResponse
