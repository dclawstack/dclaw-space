from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.desk_booking import DeskBooking, BookingStatus
from app.models.room_booking import RoomBooking
from app.models.desk import Desk
from app.models.floor import Floor
from app.repositories.booking_repo import DeskBookingRepository

router = APIRouter()


@router.get("/utilization")
async def desk_utilization(
    date_from: date = Query(...),
    date_to: date = Query(...),
    floor_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    if date_to < date_from:
        raise HTTPException(status_code=422, detail="date_to must be >= date_from")
    repo = DeskBookingRepository(db)
    data = await repo.utilization_by_date(date_from, date_to)
    return {"date_from": str(date_from), "date_to": str(date_to), "data": data}


@router.get("/summary")
async def utilization_summary(
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Returns per-floor utilization counts for the date range."""
    if date_to < date_from:
        raise HTTPException(status_code=422, detail="date_to must be >= date_from")

    result = await db.execute(
        select(Floor.id, Floor.name, func.count(DeskBooking.id).label("bookings"))
        .join(Desk, Desk.floor_id == Floor.id)
        .join(DeskBooking, DeskBooking.desk_id == Desk.id)
        .where(
            DeskBooking.date >= date_from,
            DeskBooking.date <= date_to,
            DeskBooking.status != BookingStatus.CANCELLED,
        )
        .group_by(Floor.id, Floor.name)
        .order_by(Floor.name)
    )
    rows = result.all()

    total_desks_result = await db.execute(
        select(func.count(Desk.id)).where(Desk.is_active == True)
    )
    total_desks = total_desks_result.scalar() or 0
    days = (date_to - date_from).days + 1
    capacity = total_desks * days

    return {
        "date_from": str(date_from),
        "date_to": str(date_to),
        "total_capacity": capacity,
        "by_floor": [{"floor_id": str(r.id), "floor_name": r.name, "bookings": r.bookings} for r in rows],
    }


@router.get("/predictions")
async def attendance_predictions(
    days_ahead: int = Query(14, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
):
    """Simple moving average prediction for next N days."""
    today = date.today()
    history_start = today - timedelta(days=28)

    result = await db.execute(
        select(DeskBooking.date, func.count(DeskBooking.id).label("count"))
        .where(
            DeskBooking.date >= history_start,
            DeskBooking.date < today,
            DeskBooking.status != BookingStatus.CANCELLED,
        )
        .group_by(DeskBooking.date)
        .order_by(DeskBooking.date)
    )
    history = {row.date: row.count for row in result.all()}

    # Day-of-week moving average
    dow_avg: dict[int, float] = {}
    dow_count: dict[int, int] = {}
    cursor = history_start
    while cursor < today:
        dow = cursor.weekday()
        val = history.get(cursor, 0)
        dow_avg[dow] = dow_avg.get(dow, 0) + val
        dow_count[dow] = dow_count.get(dow, 0) + 1
        cursor += timedelta(days=1)

    for dow in dow_avg:
        dow_avg[dow] = round(dow_avg[dow] / dow_count[dow], 1)

    predictions = []
    for i in range(days_ahead):
        pred_date = today + timedelta(days=i)
        dow = pred_date.weekday()
        predictions.append({
            "date": str(pred_date),
            "predicted_bookings": dow_avg.get(dow, 0),
            "day": pred_date.strftime("%A"),
        })

    return {"predictions": predictions, "model": "day-of-week moving average (28-day window)"}


@router.get("/esg")
async def esg_metrics(
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Carbon offset estimates based on unused desk-days."""
    if date_to < date_from:
        raise HTTPException(status_code=422, detail="date_to must be >= date_from")

    days = (date_to - date_from).days + 1

    total_desks_r = await db.execute(select(func.count(Desk.id)).where(Desk.is_active == True))
    total_desks = total_desks_r.scalar() or 0

    booked_r = await db.execute(
        select(func.count(DeskBooking.id))
        .where(
            DeskBooking.date >= date_from,
            DeskBooking.date <= date_to,
            DeskBooking.status != BookingStatus.CANCELLED,
        )
    )
    booked_desk_days = booked_r.scalar() or 0

    total_capacity = total_desks * days
    unused_desk_days = max(0, total_capacity - booked_desk_days)
    utilization_pct = round((booked_desk_days / total_capacity * 100), 1) if total_capacity > 0 else 0

    # ~0.8 kWh saved per unused desk-day (lighting + HVAC estimate), 0.233 kg CO2 per kWh (UK grid avg)
    kwh_saved = round(unused_desk_days * 0.8, 1)
    co2_kg_saved = round(kwh_saved * 0.233, 1)
    trees_equivalent = round(co2_kg_saved / 21.77, 1)  # avg tree absorbs 21.77 kg CO2/year

    return {
        "date_from": str(date_from),
        "date_to": str(date_to),
        "total_desk_days": total_capacity,
        "booked_desk_days": booked_desk_days,
        "unused_desk_days": unused_desk_days,
        "utilization_pct": utilization_pct,
        "kwh_saved": kwh_saved,
        "co2_kg_saved": co2_kg_saved,
        "trees_equivalent": trees_equivalent,
        "note": "Estimates based on 0.8 kWh/desk-day and 0.233 kg CO2/kWh",
    }
