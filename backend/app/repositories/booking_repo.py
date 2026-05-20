import uuid
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.desk_booking import DeskBooking, BookingStatus
from app.models.room_booking import RoomBooking
from app.repositories.base_repo import BaseRepository
from app.core.utils import utc_now


class DeskBookingRepository(BaseRepository[DeskBooking]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, DeskBooking)

    async def get_by_user(self, user_id: str, upcoming_only: bool = False) -> list[DeskBooking]:
        q = select(DeskBooking).where(DeskBooking.user_id == user_id)
        if upcoming_only:
            today = date.today()
            q = q.where(DeskBooking.date >= today)
        q = q.order_by(DeskBooking.date.desc())
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_for_date_on_floor(self, floor_id: uuid.UUID, booking_date: date) -> list[DeskBooking]:
        from app.models.desk import Desk
        q = (
            select(DeskBooking)
            .join(Desk, DeskBooking.desk_id == Desk.id)
            .where(
                Desk.floor_id == floor_id,
                DeskBooking.date == booking_date,
                DeskBooking.status != BookingStatus.CANCELLED,
            )
        )
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def check_in(self, booking: DeskBooking) -> DeskBooking:
        booking.status = BookingStatus.CHECKED_IN
        booking.checked_in_at = utc_now()
        booking.updated_at = utc_now()
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def cancel(self, booking: DeskBooking) -> DeskBooking:
        booking.status = BookingStatus.CANCELLED
        booking.updated_at = utc_now()
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def utilization_by_date(self, date_from: date, date_to: date) -> list[dict]:
        result = await self.db.execute(
            select(DeskBooking.date, func.count(DeskBooking.id).label("bookings"))
            .where(
                DeskBooking.date >= date_from,
                DeskBooking.date <= date_to,
                DeskBooking.status != BookingStatus.CANCELLED,
            )
            .group_by(DeskBooking.date)
            .order_by(DeskBooking.date)
        )
        return [{"date": str(row.date), "bookings": row.bookings} for row in result]


class RoomBookingRepository(BaseRepository[RoomBooking]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, RoomBooking)

    async def get_by_user(self, user_id: str, upcoming_only: bool = False) -> list[RoomBooking]:
        q = select(RoomBooking).where(RoomBooking.user_id == user_id)
        if upcoming_only:
            now = utc_now()
            q = q.where(RoomBooking.end_dt >= now)
        q = q.order_by(RoomBooking.start_dt.desc())
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def cancel(self, booking: RoomBooking) -> RoomBooking:
        booking.status = BookingStatus.CANCELLED
        booking.updated_at = utc_now()
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking
