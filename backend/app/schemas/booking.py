import uuid
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.desk_booking import BookingStatus


# ── Desk Bookings ──────────────────────────────────────────────

class DeskBookingCreate(BaseModel):
    desk_id: uuid.UUID
    date: date


class DeskBookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    desk_id: uuid.UUID
    user_id: str
    date: date
    status: BookingStatus
    checked_in_at: datetime | None
    created_at: datetime
    updated_at: datetime


class DeskBookingListOut(BaseModel):
    items: list[DeskBookingOut]
    total: int


# ── Room Bookings ──────────────────────────────────────────────

class RoomBookingCreate(BaseModel):
    room_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=200)
    start_dt: datetime
    end_dt: datetime
    attendee_count: int = Field(1, ge=1)

    @model_validator(mode="after")
    def end_after_start(self) -> "RoomBookingCreate":
        if self.end_dt <= self.start_dt:
            raise ValueError("end_dt must be after start_dt")
        return self


class RoomBookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    room_id: uuid.UUID
    user_id: str
    title: str
    start_dt: datetime
    end_dt: datetime
    attendee_count: int
    status: BookingStatus
    created_at: datetime
    updated_at: datetime


class RoomBookingListOut(BaseModel):
    items: list[RoomBookingOut]
    total: int
