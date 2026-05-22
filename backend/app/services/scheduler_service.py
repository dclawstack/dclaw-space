"""Ghost meeting prevention: auto-cancel room bookings with no check-in after 15 min."""
import logging
from datetime import timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.utils import utc_now
from app.models.room_booking import RoomBooking
from app.models.desk_booking import BookingStatus

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


async def _release_ghost_meetings(session_factory):
    async with session_factory() as db:
        now = utc_now()
        cutoff = now - timedelta(minutes=15)
        q = select(RoomBooking).where(
            RoomBooking.status == BookingStatus.CONFIRMED,
            RoomBooking.start_dt <= cutoff,
        )
        result = await db.execute(q)
        bookings = result.scalars().all()

        for booking in bookings:
            booking.status = BookingStatus.CANCELLED
            booking.updated_at = now
            db.add(booking)
            logger.info(f"Auto-cancelled ghost meeting {booking.id} ({booking.title})")

        if bookings:
            await db.commit()
            logger.info(f"Released {len(bookings)} ghost meeting(s)")


def start_scheduler(session_factory) -> AsyncIOScheduler:
    global _scheduler
    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(
        _release_ghost_meetings,
        "interval",
        minutes=5,
        args=[session_factory],
        id="ghost_meeting_cleanup",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("Scheduler started — ghost meeting cleanup every 5 minutes")
    return _scheduler


def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
