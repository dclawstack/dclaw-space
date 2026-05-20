import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.core.utils import utc_now

if TYPE_CHECKING:
    from app.models.desk import Desk
    from app.models.room import Room


class Floor(Base):
    __tablename__ = "floors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    level: Mapped[int] = mapped_column(Integer)
    svg_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    width: Mapped[int] = mapped_column(Integer, default=1000)
    height: Mapped[int] = mapped_column(Integer, default=800)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    desks: Mapped[list["Desk"]] = relationship(
        "Desk", back_populates="floor", lazy="selectin", cascade="all, delete-orphan"
    )
    rooms: Mapped[list["Room"]] = relationship(
        "Room", back_populates="floor", lazy="selectin", cascade="all, delete-orphan"
    )
