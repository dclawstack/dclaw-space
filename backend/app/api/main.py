import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.api.routes import health
from app.api.v1 import (
    floors, desks, rooms, bookings, visitors, analytics, copilot, auth, org,
    presence, waiting_list, slack_bot, websocket_floor,
)

_IS_SERVERLESS = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

if not _IS_SERVERLESS:
    from app.services.scheduler_service import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    if not _IS_SERVERLESS:
        start_scheduler(AsyncSessionLocal)
    yield
    if not _IS_SERVERLESS:
        stop_scheduler()


app = FastAPI(
    title=settings.app_name,
    version="1.2.0",
    description="DClaw Space — AI-native workspace optimization",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(floors.router, prefix="/api/v1/floors", tags=["floors"])
app.include_router(desks.router, prefix="/api/v1/desks", tags=["desks"])
app.include_router(rooms.router, prefix="/api/v1/rooms", tags=["rooms"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["bookings"])
app.include_router(visitors.router, prefix="/api/v1/visitors", tags=["visitors"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["copilot"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(org.router, prefix="/api/v1/org", tags=["org"])
app.include_router(presence.router, prefix="/api/v1/presence", tags=["presence"])
app.include_router(waiting_list.router, prefix="/api/v1/waiting-list", tags=["waiting-list"])
app.include_router(slack_bot.router, prefix="/api/v1/slack", tags=["slack"])
app.include_router(websocket_floor.router, prefix="/api/v1", tags=["websocket"])
