import asyncio

from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import StreamingResponse
from redis.asyncio import Redis

from src.core.config import settings
from src.events.dependencies import get_redis

router = APIRouter(tags=["sse"])


@router.get("/stream")
def stream_events(
    request: Request,
    last_event_id: str | None = Header(None, alias="Last-Event-ID"),
    redis: Redis = Depends(get_redis),
):
    async def event_generator():
        current_id = last_event_id if last_event_id else "$"

        try:
            while True:
                if await request.is_disconnected():
                    break

                response = await redis.xread(
                    {settings.sse_stream_key: current_id},
                    block=settings.sse_timeout,
                    count=settings.sse_count,
                )

                if response:
                    for _, messages in response:
                        for msg_id, data in messages:
                            current_id = msg_id

                            yield (
                                f"id: {msg_id}\n"
                                f"event: {data.get('event')}\n"
                                f"data: {data.get('data')}\n\n"
                            )
                else:
                    yield ": ping\n\n"

                    if current_id == "$":
                        info = await redis.xinfo_stream(settings.sse_stream_key)
                        if info and info.get("last-generated-id"):
                            current_id = info["last-generated-id"]
        except asyncio.CancelledError:
            pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")
