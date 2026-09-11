import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import User
from pydantic import BaseModel
from app.auth import get_password_hash
from app.dependencies import get_current_user, get_current_user_role
from typing import List

router = APIRouter()

UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}
MAX_AVATAR_BYTES = 2 * 1024 * 1024  # 2MB

# Pydantic schema for user input/output
class UserCreate(BaseModel):
    username: str
    email: str
    lecturer_id: int | None = None
    student_id: int | None = None
    password: str  # Plain text password for now (we'll hash it later)
    role: str

class UserOut(BaseModel):
    user_id: int
    username: str
    lecturer_id: int | None = None
    student_id: int | None = None
    email: str
    role: str
    profile_image: str | None = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    username: str
    email: str
    password: str | None = None  # only hashed/applied if provided


async def _save_avatar(file: UploadFile, user_id: int) -> str:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="File must be a PNG, JPEG, GIF, or WEBP image")

    contents = await file.read()
    if len(contents) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=400, detail="Image must be under 2MB")

    ext = os.path.splitext(file.filename or "")[1].lower() or ".png"
    # Unique filename per upload (not just per-user) so a stale browser/CDN
    # cache of the old file never lingers under the same URL.
    filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(contents)
    return f"/uploads/avatars/{filename}"


# --- Self-service profile endpoints (registered before /users/{user_id} so
# "me" is never parsed as a user_id) ---

@router.get("/users/me", response_model=UserOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/users/me", response_model=UserOut)
async def update_my_profile(
    payload: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(User).filter(User.email == payload.email, User.user_id != current_user.user_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    current_user.username = payload.username
    current_user.email = payload.email
    if payload.password:
        current_user.password_hash = get_password_hash(payload.password)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/users/me/avatar", response_model=UserOut)
async def upload_my_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.profile_image = await _save_avatar(file, current_user.user_id)
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/users/", response_model=UserOut)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(User).filter(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        lecturer_id=user.lecturer_id if user.lecturer_id is not None else None,
        student_id=user.student_id if user.student_id is not None else None,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.get("/users/", response_model=List[UserOut])
async def get_users(
    role: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(User)
    if role:
        query = query.filter(User.role == role)
    result = await db.execute(query)
    users = result.scalars().all()
    return [
        UserOut(
            user_id=user.user_id,
            username=user.username,
            lecturer_id=user.lecturer_id if user.lecturer_id is not None else None,
            student_id=user.student_id if user.student_id is not None else None,
            email=user.email,
            role=user.role,
            profile_image=user.profile_image,
        )
        for user in users
    ]

@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    user: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(User).filter(User.user_id == user_id))
    existing_user = result.scalars().first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user.username = user.username
    existing_user.email = user.email
    existing_user.password_hash = get_password_hash(user.password)
    existing_user.role = user.role

    db.add(existing_user)
    await db.commit()
    await db.refresh(existing_user)
    return existing_user


@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(User).filter(User.user_id == user_id))
    existing_user = result.scalars().first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(existing_user)
    await db.commit()
    return {"message": "User deleted successfully"}

@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(User).filter(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/users/{user_id}/avatar", response_model=UserOut)
async def upload_user_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(User).filter(User.user_id == user_id))
    target_user = result.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.profile_image = await _save_avatar(file, target_user.user_id)
    db.add(target_user)
    await db.commit()
    await db.refresh(target_user)
    return target_user
