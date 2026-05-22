"""Organization management endpoints."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.repositories.auth_repo import AuthRepository
from app.schemas.auth import UserOut, OrgOut
from pydantic import BaseModel

router = APIRouter()


class OrgUpdate(BaseModel):
    name: str | None = None
    plan: str | None = None
    seat_count: int | None = None


class UserRoleUpdate(BaseModel):
    role: UserRole
    is_active: bool | None = None


class MemberOut(UserOut):
    pass


@router.get("/", response_model=OrgOut)
async def get_org(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.patch("/", response_model=OrgOut)
async def update_org(
    body: OrgUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    await db.commit()
    await db.refresh(org)
    return org


@router.get("/members", response_model=list[MemberOut])
async def list_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.org_id == current_user.org_id))
    return result.scalars().all()


@router.patch("/members/{user_id}", response_model=MemberOut)
async def update_member(
    user_id: uuid.UUID,
    body: UserRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(
        select(User).where(User.id == user_id, User.org_id == current_user.org_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    member.role = body.role
    if body.is_active is not None:
        member.is_active = body.is_active
    await db.commit()
    await db.refresh(member)
    return member


@router.get("/usage")
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns seat usage stats for the billing page."""
    from app.models.floor import Floor
    from app.models.desk import Desk
    from app.models.room import Room

    member_count = await db.scalar(
        select(func.count(User.id)).where(User.org_id == current_user.org_id, User.is_active == True)
    )
    floor_count = await db.scalar(
        select(func.count(Floor.id)).where(Floor.is_active == True)
    )
    desk_count = await db.scalar(
        select(func.count(Desk.id)).where(Desk.is_active == True)
    )
    room_count = await db.scalar(
        select(func.count(Room.id)).where(Room.is_active == True)
    )

    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one_or_none()

    return {
        "plan": org.plan if org else "free",
        "members": member_count or 0,
        "floors": floor_count or 0,
        "desks": desk_count or 0,
        "rooms": room_count or 0,
        "seat_limit": org.seat_count if org else 5,
    }
