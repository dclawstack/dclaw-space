from datetime import datetime, date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.visitor import Visitor, VisitorStatus
from app.repositories.base_repo import BaseRepository
from app.core.utils import utc_now


class VisitorRepository(BaseRepository[Visitor]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Visitor)

    async def get_today(self, query_date: date | None = None) -> list[Visitor]:
        target = query_date or date.today()
        q = select(Visitor).where(
            Visitor.expected_at >= datetime.combine(target, datetime.min.time()),
            Visitor.expected_at < datetime.combine(target, datetime.max.time()),
        ).order_by(Visitor.expected_at)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_host(self, host_user_id: str) -> list[Visitor]:
        q = select(Visitor).where(Visitor.host_user_id == host_user_id).order_by(Visitor.expected_at.desc())
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_badge(self, badge_token: str) -> Visitor | None:
        q = select(Visitor).where(Visitor.badge_token == badge_token)
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    async def check_in(self, visitor: Visitor) -> Visitor:
        visitor.status = VisitorStatus.CHECKED_IN
        visitor.checked_in_at = utc_now()
        visitor.updated_at = utc_now()
        self.db.add(visitor)
        await self.db.commit()
        await self.db.refresh(visitor)
        return visitor

    async def check_out(self, visitor: Visitor) -> Visitor:
        visitor.status = VisitorStatus.CHECKED_OUT
        visitor.checked_out_at = utc_now()
        visitor.updated_at = utc_now()
        self.db.add(visitor)
        await self.db.commit()
        await self.db.refresh(visitor)
        return visitor
