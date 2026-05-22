import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_preference import UserPreference
from app.repositories.base_repo import BaseRepository


class UserPreferenceRepository(BaseRepository[UserPreference]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, UserPreference)

    async def get_by_user(self, user_id: str) -> UserPreference | None:
        q = select(UserPreference).where(UserPreference.user_id == user_id)
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    async def upsert(
        self,
        user_id: str,
        floor_id: uuid.UUID | None = None,
        zone: str | None = None,
        desk_id: uuid.UUID | None = None,
    ) -> UserPreference:
        pref = await self.get_by_user(user_id)
        if pref is None:
            pref = UserPreference(user_id=user_id)
            self.db.add(pref)
        if floor_id:
            pref.preferred_floor_id = floor_id
        if zone:
            pref.preferred_zone = zone
        if desk_id:
            pref.preferred_desk_id = desk_id
        pref.booking_count = (pref.booking_count or 0) + 1
        await self.db.commit()
        await self.db.refresh(pref)
        return pref
