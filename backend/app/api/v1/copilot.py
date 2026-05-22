from datetime import date
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.bookings import get_current_user
from app.repositories.booking_repo import DeskBookingRepository, RoomBookingRepository
from app.repositories.floor_repo import FloorRepository
from app.services.copilot_service import stream_copilot_response

router = APIRouter()


@router.get("/context")
async def copilot_context(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    desk_repo = DeskBookingRepository(db)
    room_repo = RoomBookingRepository(db)
    floor_repo = FloorRepository(db)

    desk_bookings = await desk_repo.get_by_user(user_id, upcoming_only=True)
    room_bookings = await room_repo.get_by_user(user_id, upcoming_only=True)
    floors = await floor_repo.get_active()

    return {
        "user_id": user_id,
        "upcoming_desk_bookings": len(desk_bookings),
        "upcoming_room_bookings": len(room_bookings),
        "active_floors": len(floors),
        "today": str(date.today()),
    }


@router.post("/chat")
async def copilot_chat(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Streaming SSE endpoint — yields JSON chunks {role, content, done}."""
    body = await request.json()
    messages = body.get("messages", [])
    context = body.get("context", {})

    return StreamingResponse(
        stream_copilot_response(messages, context, user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
