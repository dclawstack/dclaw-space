from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.desk_booking import DeskBooking, BookingStatus
from app.models.desk import Desk
from app.models.floor import Floor

router = APIRouter()


@router.get("/today")
async def who_is_in_today(
    target_date: date = Query(None),
    floor_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Returns list of user_ids with confirmed desk bookings today, with floor/desk info."""
    booking_date = target_date or date.today()

    q = (
        select(
            DeskBooking.user_id,
            Desk.label.label("desk_label"),
            Desk.zone,
            Floor.name.label("floor_name"),
            Floor.id.label("floor_id"),
        )
        .join(Desk, DeskBooking.desk_id == Desk.id)
        .join(Floor, Desk.floor_id == Floor.id)
        .where(
            DeskBooking.date == booking_date,
            DeskBooking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
        )
    )
    if floor_id:
        q = q.where(Floor.id == floor_id)

    result = await db.execute(q)
    rows = result.all()

    # Count checked-in vs confirmed
    checked_in = sum(1 for r in rows if True)  # join doesn't expose status here — requery
    checkin_q = (
        select(func.count(DeskBooking.id))
        .join(Desk, DeskBooking.desk_id == Desk.id)
        .join(Floor, Desk.floor_id == Floor.id)
        .where(
            DeskBooking.date == booking_date,
            DeskBooking.status == BookingStatus.CHECKED_IN,
        )
    )
    if floor_id:
        checkin_q = checkin_q.where(Floor.id == floor_id)
    checked_in_count = (await db.execute(checkin_q)).scalar() or 0

    users = [
        {
            "user_id": r.user_id,
            "desk_label": r.desk_label,
            "zone": r.zone,
            "floor_name": r.floor_name,
            "floor_id": str(r.floor_id),
        }
        for r in rows
    ]

    return {
        "date": str(booking_date),
        "total_in_office": len(users),
        "checked_in": checked_in_count,
        "expected": len(users) - checked_in_count,
        "users": users,
    }
