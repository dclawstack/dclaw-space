import uuid
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.desk import Desk
from app.models.desk_booking import DeskBooking, BookingStatus
from app.repositories.base_repo import BaseRepository
from app.core.utils import utc_now


class DeskRepository(BaseRepository[Desk]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Desk)

    async def list_by_floor(self, floor_id: uuid.UUID) -> list[Desk]:
        result = await self.db.execute(
            select(Desk)
            .where(Desk.floor_id == floor_id, Desk.is_active == True)
            .order_by(Desk.label)
        )
        return list(result.scalars().all())

    async def get_available(self, booking_date: date, floor_id: uuid.UUID | None = None) -> list[Desk]:
        """Return desks with no confirmed/checked-in booking on the given date."""
        booked_ids = select(DeskBooking.desk_id).where(
            DeskBooking.date == booking_date,
            DeskBooking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
        )
        q = select(Desk).where(
            Desk.is_active == True,
            Desk.id.not_in(booked_ids),
        )
        if floor_id:
            q = q.where(Desk.floor_id == floor_id)
        q = q.order_by(Desk.label)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def update(self, desk: Desk, data: dict) -> Desk:
        for key, value in data.items():
            setattr(desk, key, value)
        desk.updated_at = utc_now()
        self.db.add(desk)
        await self.db.commit()
        await self.db.refresh(desk)
        return desk
