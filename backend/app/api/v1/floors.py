import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.desk_booking import BookingStatus
from app.repositories.floor_repo import FloorRepository
from app.repositories.desk_repo import DeskRepository
from app.repositories.booking_repo import DeskBookingRepository
from app.schemas.floor import FloorCreate, FloorUpdate, FloorOut, FloorListOut

router = APIRouter()


@router.get("/", response_model=FloorListOut)
async def list_floors(
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    repo = FloorRepository(db)
    if active_only:
        items = await repo.get_active()
        return FloorListOut(items=items, total=len(items))
    items, total = await repo.list_all(limit=100)
    return FloorListOut(items=items, total=total)


@router.post("/", response_model=FloorOut, status_code=201)
async def create_floor(body: FloorCreate, db: AsyncSession = Depends(get_db)):
    from app.models.floor import Floor
    repo = FloorRepository(db)
    floor = Floor(**body.model_dump())
    return await repo.create(floor)


@router.get("/{floor_id}", response_model=FloorOut)
async def get_floor(floor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = FloorRepository(db)
    floor = await repo.get_by_id(floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    return floor


@router.put("/{floor_id}", response_model=FloorOut)
async def update_floor(
    floor_id: uuid.UUID, body: FloorUpdate, db: AsyncSession = Depends(get_db)
):
    repo = FloorRepository(db)
    floor = await repo.get_by_id(floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    return await repo.update(floor, body.model_dump(exclude_none=True))


@router.patch("/{floor_id}", response_model=FloorOut)
async def patch_floor(
    floor_id: uuid.UUID, body: FloorUpdate, db: AsyncSession = Depends(get_db)
):
    repo = FloorRepository(db)
    floor = await repo.get_by_id(floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    return await repo.update(floor, body.model_dump(exclude_unset=True))


@router.delete("/{floor_id}", status_code=204)
async def delete_floor(floor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = FloorRepository(db)
    floor = await repo.get_by_id(floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    await repo.delete(floor)


@router.get("/{floor_id}/occupancy")
async def get_floor_occupancy(
    floor_id: uuid.UUID,
    booking_date: date = Query(..., alias="date", description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
):
    """Return a {desk_id: status} map for the given floor and date.
    Status values: 'available', 'booked', 'checked_in', 'inactive'
    """
    floor_repo = FloorRepository(db)
    floor = await floor_repo.get_by_id(floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")

    desk_repo = DeskRepository(db)
    desks = await desk_repo.list_by_floor(floor_id)

    booking_repo = DeskBookingRepository(db)
    bookings = await booking_repo.get_for_date_on_floor(floor_id, booking_date)

    status_map: dict[str, str] = {}
    booked_ids = {
        str(b.desk_id): b.status
        for b in bookings
        if b.status != BookingStatus.CANCELLED
    }

    for desk in desks:
        desk_id = str(desk.id)
        if not desk.is_active:
            status_map[desk_id] = "inactive"
        elif desk_id in booked_ids:
            status_map[desk_id] = booked_ids[desk_id].value
        else:
            status_map[desk_id] = "available"

    # Also include inactive desks not returned by list_by_floor
    return {
        "floor_id": str(floor_id),
        "date": str(booking_date),
        "total_desks": len(desks),
        "available": sum(1 for s in status_map.values() if s == "available"),
        "booked": sum(1 for s in status_map.values() if s in ("confirmed", "checked_in")),
        "occupancy": status_map,
    }
