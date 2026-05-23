import uuid
from datetime import date
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.models.waiting_list import WaitingListEntry
from app.models.desk import Desk

router = APIRouter()


def get_current_user(x_user_id: str = Header(default="anonymous")) -> str:
    return x_user_id


class WaitingListCreate(BaseModel):
    desk_id: uuid.UUID
    date: date


class WaitingListOut(BaseModel):
    id: uuid.UUID
    desk_id: uuid.UUID
    user_id: str
    date: date
    notified: bool
    position: int

    model_config = {"from_attributes": True}


@router.post("/", status_code=201)
async def join_waiting_list(
    body: WaitingListCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    desk = await db.get(Desk, body.desk_id)
    if not desk or not desk.is_active:
        raise HTTPException(status_code=404, detail="Desk not found")

    # Prevent duplicate entries
    existing = await db.execute(
        select(WaitingListEntry).where(
            WaitingListEntry.desk_id == body.desk_id,
            WaitingListEntry.user_id == user_id,
            WaitingListEntry.date == body.date,
        )
    )
    if existing.scalar():
        raise HTTPException(status_code=409, detail="Already on waiting list for this desk/date")

    entry = WaitingListEntry(desk_id=body.desk_id, user_id=user_id, date=body.date)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    # Position in queue
    position_r = await db.execute(
        select(WaitingListEntry)
        .where(WaitingListEntry.desk_id == body.desk_id, WaitingListEntry.date == body.date)
        .order_by(WaitingListEntry.created_at)
    )
    entries = list(position_r.scalars().all())
    pos = next((i + 1 for i, e in enumerate(entries) if str(e.id) == str(entry.id)), len(entries))

    return {
        "id": str(entry.id), "desk_id": str(entry.desk_id),
        "user_id": entry.user_id, "date": str(entry.date),
        "notified": entry.notified, "position": pos,
    }


@router.get("/mine")
async def my_waiting_list(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WaitingListEntry)
        .where(WaitingListEntry.user_id == user_id, WaitingListEntry.date >= date.today())
        .order_by(WaitingListEntry.date)
    )
    entries = list(result.scalars().all())
    return {"items": [
        {"id": str(e.id), "desk_id": str(e.desk_id), "date": str(e.date), "notified": e.notified}
        for e in entries
    ], "total": len(entries)}


@router.delete("/{entry_id}", status_code=204)
async def leave_waiting_list(
    entry_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = await db.get(WaitingListEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    if entry.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your entry")
    await db.delete(entry)
    await db.commit()
