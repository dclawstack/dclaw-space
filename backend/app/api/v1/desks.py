import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.desk_repo import DeskRepository
from app.schemas.desk import DeskCreate, DeskUpdate, DeskOut, DeskListOut

router = APIRouter()


@router.get("/", response_model=DeskListOut)
async def list_desks(
    floor_id: uuid.UUID | None = Query(None),
    active_only: bool = Query(True),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = DeskRepository(db)
    if floor_id:
        items = await repo.list_by_floor(floor_id)
        return DeskListOut(items=items, total=len(items))
    items, total = await repo.list_all(limit=limit, offset=offset)
    return DeskListOut(items=items, total=total)


@router.get("/available", response_model=DeskListOut)
async def get_available_desks(
    booking_date: date = Query(..., alias="date"),
    floor_id: uuid.UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Return desks with no booking on the given date (Complexity 1: availability logic)."""
    repo = DeskRepository(db)
    items = await repo.get_available(booking_date, floor_id)
    return DeskListOut(items=items, total=len(items))


@router.post("/", response_model=DeskOut, status_code=201)
async def create_desk(body: DeskCreate, db: AsyncSession = Depends(get_db)):
    from app.models.desk import Desk
    from app.repositories.floor_repo import FloorRepository

    floor_repo = FloorRepository(db)
    floor = await floor_repo.get_by_id(body.floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")

    repo = DeskRepository(db)
    desk = Desk(**body.model_dump())
    return await repo.create(desk)


@router.get("/{desk_id}", response_model=DeskOut)
async def get_desk(desk_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = DeskRepository(db)
    desk = await repo.get_by_id(desk_id)
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    return desk


@router.put("/{desk_id}", response_model=DeskOut)
async def update_desk(
    desk_id: uuid.UUID, body: DeskUpdate, db: AsyncSession = Depends(get_db)
):
    repo = DeskRepository(db)
    desk = await repo.get_by_id(desk_id)
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    return await repo.update(desk, body.model_dump(exclude_none=True))


@router.patch("/{desk_id}", response_model=DeskOut)
async def patch_desk(
    desk_id: uuid.UUID, body: DeskUpdate, db: AsyncSession = Depends(get_db)
):
    repo = DeskRepository(db)
    desk = await repo.get_by_id(desk_id)
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    return await repo.update(desk, body.model_dump(exclude_unset=True))


@router.delete("/{desk_id}", status_code=204)
async def delete_desk(desk_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = DeskRepository(db)
    desk = await repo.get_by_id(desk_id)
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    await repo.delete(desk)


@router.get("/neighborhood/suggest", response_model=DeskListOut)
async def suggest_neighborhood_desks(
    near_user_id: str = Query(..., description="Sit near this user — returns desks on the same floor/zone"),
    booking_date: date = Query(..., alias="date"),
    db: AsyncSession = Depends(get_db),
):
    """
    Neighborhood booking: find available desks near where a teammate is sitting.
    Looks up the teammate's booking for that date, then returns available desks
    on the same floor/zone sorted by proximity (euclidean distance).
    """
    import math
    from sqlalchemy import select
    from app.models.desk_booking import DeskBooking, BookingStatus
    from app.models.desk import Desk as DeskModel

    # Find teammate's desk for the date
    teammate_booking_r = await db.execute(
        select(DeskBooking)
        .where(
            DeskBooking.user_id == near_user_id,
            DeskBooking.date == booking_date,
            DeskBooking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
        )
        .limit(1)
    )
    teammate_booking = teammate_booking_r.scalar()
    if not teammate_booking:
        # Fall back to all available desks if teammate has no booking
        repo = DeskRepository(db)
        items = await repo.get_available(booking_date)
        return DeskListOut(items=items[:10], total=len(items))

    # Get teammate's desk for coordinates
    teammate_desk = await db.get(DeskModel, teammate_booking.desk_id)
    if not teammate_desk:
        repo = DeskRepository(db)
        items = await repo.get_available(booking_date)
        return DeskListOut(items=items[:10], total=len(items))

    # Get available desks on the same floor
    repo = DeskRepository(db)
    candidates = await repo.get_available(booking_date, teammate_desk.floor_id)

    # Sort by euclidean distance to teammate
    def dist(desk: DeskModel) -> float:
        return math.sqrt((desk.x - teammate_desk.x) ** 2 + (desk.y - teammate_desk.y) ** 2)

    candidates.sort(key=dist)
    return DeskListOut(items=candidates[:10], total=len(candidates))
