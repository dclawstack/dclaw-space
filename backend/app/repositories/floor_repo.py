import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.floor import Floor
from app.repositories.base_repo import BaseRepository
from app.core.utils import utc_now


class FloorRepository(BaseRepository[Floor]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Floor)

    async def get_active(self) -> list[Floor]:
        result = await self.db.execute(
            select(Floor).where(Floor.is_active == True).order_by(Floor.level)
        )
        return list(result.scalars().all())

    async def update(self, floor: Floor, data: dict) -> Floor:
        for key, value in data.items():
            setattr(floor, key, value)
        floor.updated_at = utc_now()
        self.db.add(floor)
        await self.db.commit()
        await self.db.refresh(floor)
        return floor
