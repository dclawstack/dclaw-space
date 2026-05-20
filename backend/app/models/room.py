import uuid
from datetime import datetime
from typing import Any, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.core.utils import utc_now

if TYPE_CHECKING:
    from app.models.floor import Floor
    from app.models.room_booking import RoomBooking


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    floor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("floors.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100))
    capacity: Mapped[int] = mapped_column(Integer)
    equipment: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    x: Mapped[float] = mapped_column(Float, default=0.0)
    y: Mapped[float] = mapped_column(Float, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    floor: Mapped["Floor"] = relationship(
        "Floor", back_populates="rooms", lazy="selectin"
    )
    bookings: Mapped[list["RoomBooking"]] = relationship(
        "RoomBooking", back_populates="room", lazy="selectin", cascade="all, delete-orphan"
    )
