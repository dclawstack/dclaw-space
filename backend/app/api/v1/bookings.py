import uuid
from datetime import date
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.desk_booking import BookingStatus, DeskBooking
from app.models.room_booking import RoomBooking
from app.repositories.booking_repo import DeskBookingRepository, RoomBookingRepository
from app.repositories.desk_repo import DeskRepository
from app.repositories.room_repo import RoomRepository
from app.schemas.booking import (
    DeskBookingCreate, DeskBookingOut, DeskBookingListOut,
    RoomBookingCreate, RoomBookingOut, RoomBookingListOut,
)

router = APIRouter()


def get_current_user(x_user_id: str = Header(default="anonymous")) -> str:
    """Extracts caller identity from X-User-ID header.
    Replace with real JWT validation when auth is wired.
    """
    return x_user_id


# ── Desk Bookings ──────────────────────────────────────────────────────────────

@router.get("/desks/mine", response_model=DeskBookingListOut)
async def my_desk_bookings(
    upcoming_only: bool = Query(True),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DeskBookingRepository(db)
    items = await repo.get_by_user(user_id, upcoming_only)
    return DeskBookingListOut(items=items, total=len(items))


@router.post("/desks/", response_model=DeskBookingOut, status_code=201)
async def create_desk_booking(
    body: DeskBookingCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    desk_repo = DeskRepository(db)
    desk = await desk_repo.get_by_id(body.desk_id)
    if not desk or not desk.is_active:
        raise HTTPException(status_code=404, detail="Desk not found or inactive")

    # Conflict check
    available = await desk_repo.get_available(body.date, desk.floor_id)
    available_ids = {str(d.id) for d in available}
    if str(body.desk_id) not in available_ids:
        raise HTTPException(status_code=409, detail="Desk already booked for this date")

    booking_repo = DeskBookingRepository(db)
    booking = DeskBooking(
        desk_id=body.desk_id,
        user_id=user_id,
        date=body.date,
        status=BookingStatus.CONFIRMED,
    )
    return await booking_repo.create(booking)


@router.post("/desks/{booking_id}/checkin", response_model=DeskBookingOut)
async def check_in_desk(
    booking_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DeskBookingRepository(db)
    booking = await repo.get_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != BookingStatus.CONFIRMED:
        raise HTTPException(status_code=409, detail=f"Cannot check in: status is {booking.status.value}")
    return await repo.check_in(booking)


@router.delete("/desks/{booking_id}", status_code=204)
async def cancel_desk_booking(
    booking_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DeskBookingRepository(db)
    booking = await repo.get_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=409, detail="Already cancelled")
    await repo.cancel(booking)


# ── Room Bookings ──────────────────────────────────────────────────────────────

@router.get("/rooms/mine", response_model=RoomBookingListOut)
async def my_room_bookings(
    upcoming_only: bool = Query(True),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = RoomBookingRepository(db)
    items = await repo.get_by_user(user_id, upcoming_only)
    return RoomBookingListOut(items=items, total=len(items))


@router.post("/rooms/", response_model=RoomBookingOut, status_code=201)
async def create_room_booking(
    body: RoomBookingCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    room_repo = RoomRepository(db)
    room = await room_repo.get_by_id(body.room_id)
    if not room or not room.is_active:
        raise HTTPException(status_code=404, detail="Room not found or inactive")

    if body.attendee_count > room.capacity:
        raise HTTPException(
            status_code=422,
            detail=f"Room capacity is {room.capacity}, requested {body.attendee_count} attendees",
        )

    available = await room_repo.get_available(body.start_dt, body.end_dt, 1, room.floor_id)
    available_ids = {str(r.id) for r in available}
    if str(body.room_id) not in available_ids:
        raise HTTPException(status_code=409, detail="Room already booked for this time slot")

    booking_repo = RoomBookingRepository(db)
    booking = RoomBooking(
        room_id=body.room_id,
        user_id=user_id,
        title=body.title,
        start_dt=body.start_dt,
        end_dt=body.end_dt,
        attendee_count=body.attendee_count,
        status=BookingStatus.CONFIRMED,
    )
    return await booking_repo.create(booking)


@router.delete("/rooms/{booking_id}", status_code=204)
async def cancel_room_booking(
    booking_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = RoomBookingRepository(db)
    booking = await repo.get_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=409, detail="Already cancelled")
    await repo.cancel(booking)


# ── Analytics helper (Complexity 1) ───────────────────────────────────────────

@router.get("/analytics/utilization")
async def desk_utilization(
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Daily desk booking counts for the given date range."""
    if date_to < date_from:
        raise HTTPException(status_code=422, detail="date_to must be >= date_from")
    repo = DeskBookingRepository(db)
    data = await repo.utilization_by_date(date_from, date_to)
    return {"date_from": str(date_from), "date_to": str(date_to), "data": data}
