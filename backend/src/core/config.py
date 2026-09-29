from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str

    redis_url: str

    sse_stream_key: str = "sse_stream"
    sse_maxlen: int = 100
    sse_timeout: int = 1000
    sse_count: int = 10

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"

    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    posts_per_update: int = 5
    posts_preload: int = 10

    comments_per_update: int = 5
    comments_preloaded: int = 3

    model_config = {
        "env_file": ".env",
    }


settings = Settings()
