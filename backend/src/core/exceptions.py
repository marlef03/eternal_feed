from fastapi import HTTPException


class UserNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="User not found",
        )


class PostNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Post not found",
        )


class CommentNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Comment not found",
        )


class InvalidCredentialsError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail="Incorrect username or password",
        )


class UnauthorizedError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail="No access, sign in please",
        )


class WrongUserError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=401,
            detail=(
                "You are not allowed to perform this"
                "command: resource belongs to different user"
            ),
        )
