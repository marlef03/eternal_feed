from fastapi import FastAPI

from src.api.router import api_router

app = FastAPI(
    title="eternal_feed API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)


app.include_router(api_router)


@app.get("/health")
async def health():
    return "ok"
