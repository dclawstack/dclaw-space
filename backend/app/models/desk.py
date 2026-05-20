import uuid
from datetime import datetime
from typing import Any, TYPE_CHECKING
from sqlalchemy import String, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.core.utils import utc_now

if TYPE_CHECKING:
    from app.models.floor import Floor
    from app.models.desk_booking import DeskBooking


class Desk(Base):
    __tablename__ = "desks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    floor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("floors.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String(50))
    zone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    x: Mapped[float] = mapped_column(Float, default=0.0)
    y: Mapped[float] = mapped_column(Float, default=0.0)
    amenities: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    floor: Mapped["Floor"] = relationship(
        "Floor", back_populates="desks", lazy="selectin"
    )
    bookings: Mapped[list["DeskBooking"]] = relationship(
        "DeskBooking", back_populates="desk", lazy="selectin", cascade="all, delete-orphan"
    )
