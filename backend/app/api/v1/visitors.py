import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.bookings import get_current_user
from app.models.visitor import Visitor, VisitorStatus
from app.repositories.visitor_repo import VisitorRepository
from app.schemas.visitor import VisitorCreate, VisitorUpdate, VisitorOut, VisitorListOut

router = APIRouter()


@router.get("/", response_model=VisitorListOut)
async def list_visitors(
    query_date: date = Query(None, alias="date"),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = VisitorRepository(db)
    items = await repo.get_today(query_date)
    return VisitorListOut(items=items, total=len(items))


@router.get("/mine", response_model=VisitorListOut)
async def my_visitors(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = VisitorRepository(db)
    items = await repo.get_by_host(user_id)
    return VisitorListOut(items=items, total=len(items))


@router.post("/", response_model=VisitorOut, status_code=201)
async def create_visitor(
    body: VisitorCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = VisitorRepository(db)
    visitor = Visitor(**body.model_dump(), host_user_id=user_id)
    return await repo.create(visitor)


@router.get("/{visitor_id}", response_model=VisitorOut)
async def get_visitor(visitor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = VisitorRepository(db)
    v = await repo.get_by_id(visitor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return v


@router.put("/{visitor_id}", response_model=VisitorOut)
async def update_visitor(
    visitor_id: uuid.UUID,
    body: VisitorUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = VisitorRepository(db)
    v = await repo.get_by_id(visitor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Visitor not found")
    if v.host_user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your visitor")
    return await repo.update(v, body.model_dump(exclude_none=True))


@router.post("/{visitor_id}/checkin", response_model=VisitorOut)
async def checkin_visitor(visitor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = VisitorRepository(db)
    v = await repo.get_by_id(visitor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Visitor not found")
    if v.status != VisitorStatus.EXPECTED:
        raise HTTPException(status_code=409, detail=f"Cannot check in: status is {v.status.value}")
    return await repo.check_in(v)


@router.post("/{visitor_id}/checkout", response_model=VisitorOut)
async def checkout_visitor(visitor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = VisitorRepository(db)
    v = await repo.get_by_id(visitor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Visitor not found")
    if v.status != VisitorStatus.CHECKED_IN:
        raise HTTPException(status_code=409, detail=f"Not checked in: status is {v.status.value}")
    return await repo.check_out(v)


@router.delete("/{visitor_id}", status_code=204)
async def cancel_visitor(
    visitor_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = VisitorRepository(db)
    v = await repo.get_by_id(visitor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Visitor not found")
    if v.host_user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your visitor")
    await repo.update(v, {"status": VisitorStatus.CANCELLED})
