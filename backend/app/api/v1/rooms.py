import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.room_repo import RoomRepository
from app.schemas.room import RoomCreate, RoomUpdate, RoomOut, RoomListOut

router = APIRouter()


@router.get("/", response_model=RoomListOut)
async def list_rooms(
    floor_id: uuid.UUID | None = Query(None),
    capacity_min: int = Query(1, ge=1),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = RoomRepository(db)
    if floor_id:
        items = await repo.list_by_floor(floor_id)
        if capacity_min > 1:
            items = [r for r in items if r.capacity >= capacity_min]
        return RoomListOut(items=items, total=len(items))
    items, total = await repo.list_all(limit=limit, offset=offset)
    return RoomListOut(items=items, total=total)


@router.get("/available", response_model=RoomListOut)
async def get_available_rooms(
    start_dt: datetime = Query(...),
    end_dt: datetime = Query(...),
    capacity_min: int = Query(1, ge=1),
    floor_id: uuid.UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Return rooms with no overlapping booking in the given time window."""
    if end_dt <= start_dt:
        raise HTTPException(status_code=422, detail="end_dt must be after start_dt")
    repo = RoomRepository(db)
    items = await repo.get_available(start_dt, end_dt, capacity_min, floor_id)
    return RoomListOut(items=items, total=len(items))


@router.post("/", response_model=RoomOut, status_code=201)
async def create_room(body: RoomCreate, db: AsyncSession = Depends(get_db)):
    from app.models.room import Room
    from app.repositories.floor_repo import FloorRepository

    floor_repo = FloorRepository(db)
    floor = await floor_repo.get_by_id(body.floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")

    repo = RoomRepository(db)
    room = Room(**body.model_dump())
    return await repo.create(room)


@router.get("/{room_id}", response_model=RoomOut)
async def get_room(room_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = RoomRepository(db)
    room = await repo.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.put("/{room_id}", response_model=RoomOut)
async def update_room(
    room_id: uuid.UUID, body: RoomUpdate, db: AsyncSession = Depends(get_db)
):
    repo = RoomRepository(db)
    room = await repo.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return await repo.update(room, body.model_dump(exclude_none=True))


@router.delete("/{room_id}", status_code=204)
async def delete_room(room_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = RoomRepository(db)
    room = await repo.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await repo.delete(room)
