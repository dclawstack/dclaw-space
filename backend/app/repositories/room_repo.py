import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.room import Room
from app.models.room_booking import RoomBooking
from app.models.desk_booking import BookingStatus
from app.repositories.base_repo import BaseRepository
from app.core.utils import utc_now


class RoomRepository(BaseRepository[Room]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Room)

    async def list_by_floor(self, floor_id: uuid.UUID) -> list[Room]:
        result = await self.db.execute(
            select(Room)
            .where(Room.floor_id == floor_id, Room.is_active == True)
            .order_by(Room.name)
        )
        return list(result.scalars().all())

    async def get_available(
        self,
        start_dt: datetime,
        end_dt: datetime,
        capacity_min: int = 1,
        floor_id: uuid.UUID | None = None,
    ) -> list[Room]:
        """Return rooms with no overlapping confirmed booking in the given time window."""
        conflicting_ids = select(RoomBooking.room_id).where(
            RoomBooking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
            RoomBooking.start_dt < end_dt,
            RoomBooking.end_dt > start_dt,
        )
        q = select(Room).where(
            Room.is_active == True,
            Room.capacity >= capacity_min,
            Room.id.not_in(conflicting_ids),
        )
        if floor_id:
            q = q.where(Room.floor_id == floor_id)
        q = q.order_by(Room.capacity)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def update(self, room: Room, data: dict) -> Room:
        for key, value in data.items():
            setattr(room, key, value)
        room.updated_at = utc_now()
        self.db.add(room)
        await self.db.commit()
        await self.db.refresh(room)
        return room
