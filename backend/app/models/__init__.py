# Import all models so Alembic autogenerate can discover them via Base.metadata
from app.models.base import Base  # noqa: F401
from app.models.floor import Floor  # noqa: F401
from app.models.desk import Desk  # noqa: F401
from app.models.room import Room  # noqa: F401
from app.models.desk_booking import DeskBooking, BookingStatus  # noqa: F401
from app.models.room_booking import RoomBooking  # noqa: F401

__all__ = ["Base", "Floor", "Desk", "Room", "DeskBooking", "RoomBooking", "BookingStatus"]
