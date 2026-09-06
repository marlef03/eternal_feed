from pydantic import BaseModel, EmailStr


class EmailLogin(BaseModel):
    email: EmailStr
    password: str


class UsernameLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
