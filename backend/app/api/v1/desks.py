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
