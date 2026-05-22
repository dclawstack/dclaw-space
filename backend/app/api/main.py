from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.api.routes import health
from app.api.v1 import floors, desks, rooms, bookings, visitors, analytics, copilot
from app.services.scheduler_service import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    start_scheduler(AsyncSessionLocal)
    yield
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
