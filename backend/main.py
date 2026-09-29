from contextlib import asynccontextmanager

from fastapi import FastAPI
from redis.asyncio import Redis

from src.api.router import api_router
from src.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = Redis.from_url(settings.redis_url, decode_responses=True)

    yield

    await app.state.redis.aclose()


app = FastAPI(
    title="eternal_feed API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


app.include_router(api_router)


@app.get("/health")
async def health():
    return "ok"
