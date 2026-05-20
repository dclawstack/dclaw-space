import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class RoomBase(BaseModel):
    floor_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=100)
    capacity: int = Field(..., gt=0)
    equipment: dict[str, Any] = Field(default_factory=dict)
    x: float = 0.0
    y: float = 0.0


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    capacity: int | None = Field(None, gt=0)
    equipment: dict[str, Any] | None = None
    x: float | None = None
    y: float | None = None
    is_active: bool | None = None


class RoomOut(RoomBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class RoomListOut(BaseModel):
    items: list[RoomOut]
    total: int
