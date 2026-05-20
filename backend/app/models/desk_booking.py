import uuid
import enum
from datetime import datetime, date
from typing import TYPE_CHECKING
from sqlalchemy import String, Date, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.core.utils import utc_now

if TYPE_CHECKING:
    from app.models.desk import Desk


class BookingStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    CHECKED_IN = "checked_in"
    NO_SHOW = "no_show"


class DeskBooking(Base):
    __tablename__ = "desk_bookings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    desk_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("desks.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status"), default=BookingStatus.CONFIRMED
    )
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    desk: Mapped["Desk"] = relationship(
        "Desk", back_populates="bookings", lazy="selectin"
    )
