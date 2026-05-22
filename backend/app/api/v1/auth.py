import re
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.repositories.auth_repo import AuthRepository
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.dependencies import get_current_user

router = APIRouter()


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    repo = AuthRepository(db)
    if await repo.get_user_by_email(body.email.lower().strip()):
        raise HTTPException(status_code=409, detail="Email already registered")

    slug = slugify(body.org_name)
    existing = await repo.get_org_by_slug(slug)
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    org = Organization(name=body.org_name, slug=slug)
    org = await repo.create_org(org)

    user = User(
        org_id=org.id,
        email=body.email.lower().strip(),
        hashed_password=hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name,
        role=UserRole.ADMIN,
    )
    user = await repo.create_user(user)

    token = create_access_token(
        {"sub": str(user.id), "org_id": str(org.id), "role": user.role.value}
    )
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    repo = AuthRepository(db)
    user = await repo.get_user_by_email(body.email.lower().strip())
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    token = create_access_token(
        {"sub": str(user.id), "org_id": str(user.org_id), "role": user.role.value}
    )
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
