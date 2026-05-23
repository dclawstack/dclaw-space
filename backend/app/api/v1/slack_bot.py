"""
Slack bot webhook handler.
Supports slash commands: /desk-book, /desk-cancel, /who-is-in
Configure in Slack App settings:
  Slash command URL: POST /api/v1/slack/commands
  Interactivity URL: POST /api/v1/slack/interactions
"""
import hashlib
import hmac
import time
import uuid
from datetime import date, timedelta
from fastapi import APIRouter, Request, Header, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.models.desk import Desk
from app.models.desk_booking import DeskBooking, BookingStatus
from app.models.floor import Floor
from app.repositories.booking_repo import DeskBookingRepository
from app.repositories.desk_repo import DeskRepository

router = APIRouter()

SLACK_SECRET = getattr(settings, "slack_signing_secret", "")


def _verify_slack_signature(body: bytes, timestamp: str, signature: str) -> bool:
    if not SLACK_SECRET:
        return True  # skip verification in dev if secret not configured
    if abs(time.time() - int(timestamp)) > 300:
        return False
    base = f"v0:{timestamp}:{body.decode()}"
    expected = "v0=" + hmac.new(SLACK_SECRET.encode(), base.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _book_next_available(user_id: str) -> dict:
    async with AsyncSessionLocal() as db:
        desk_repo = DeskRepository(db)
        tomorrow = date.today() + timedelta(days=1)
        available = await desk_repo.get_available(tomorrow)
        if not available:
            return {"text": "No desks available tomorrow. Try the web app to pick a specific date."}
        desk = available[0]
        booking = DeskBooking(
            desk_id=desk.id, user_id=user_id, date=tomorrow, status=BookingStatus.CONFIRMED
        )
        booking_repo = DeskBookingRepository(db)
        saved = await booking_repo.create(booking)
        return {
            "response_type": "in_channel",
            "text": f"✅ Desk *{desk.label}* booked for {tomorrow} (booking ID: `{str(saved.id)[:8]}`)",
        }


async def _list_who_is_in() -> dict:
    async with AsyncSessionLocal() as db:
        today = date.today()
        result = await db.execute(
            select(DeskBooking.user_id, Desk.label)
            .join(Desk, DeskBooking.desk_id == Desk.id)
            .where(
                DeskBooking.date == today,
                DeskBooking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
            )
        )
        rows = result.all()
        if not rows:
            return {"text": "Nobody is booked in the office today."}
        lines = [f"• {r.user_id} @ {r.label}" for r in rows]
        return {
            "response_type": "in_channel",
            "text": f"*{len(rows)} people in the office today:*\n" + "\n".join(lines),
        }


@router.post("/commands")
async def slack_slash_command(
    request: Request,
    x_slack_request_timestamp: str = Header(default="0"),
    x_slack_signature: str = Header(default=""),
):
    body = await request.body()
    if not _verify_slack_signature(body, x_slack_request_timestamp, x_slack_signature):
        raise HTTPException(status_code=403, detail="Invalid Slack signature")

    form = await request.form()
    command = str(form.get("command", ""))
    user_id = str(form.get("user_id", "slack_user"))
    text = str(form.get("text", "")).strip()

    if command in ("/desk-book", "/book-desk"):
        result = await _book_next_available(user_id)
        return JSONResponse(result)

    if command in ("/who-is-in", "/whoisin"):
        result = await _list_who_is_in()
        return JSONResponse(result)

    return JSONResponse({
        "text": (
            "DClaw Space commands:\n"
            "• `/desk-book` — book a desk for tomorrow\n"
            "• `/who-is-in` — see who's in the office today"
        )
    })
