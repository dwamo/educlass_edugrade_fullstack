from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Lecturer, User
from pydantic import BaseModel
from app.dependencies import get_current_user, get_current_user_role
from typing import Optional

router = APIRouter()

# Pydantic schema for Lecturer input/output
class LecturerCreate(BaseModel):
    lecturer_id: str
    full_name: str
    email: str
    department: str
    phone_number: str
    address: str
    active_status: Optional[bool] = True
    del_status: Optional[bool] = False

class LecturerOut(BaseModel):
    staff_id: int
    lecturer_id: Optional[str]
    full_name: str
    email: str
    department: str
    phone_number: str
    address: str
    active_status: bool
    del_status: bool

    class Config:
        from_attributes = True

@router.post("/lecturers", response_model=LecturerOut)
async def create_lecturer(
    lecturer: LecturerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    new_lecturer = Lecturer(
        lecturer_id=lecturer.lecturer_id,
        # staff_id is auto-incremented, so we don't need to set it here
        full_name=lecturer.full_name,
        email=lecturer.email,
        department=lecturer.department,
        phone_number=lecturer.phone_number,
        address=lecturer.address,
        active_status=lecturer.active_status,
        del_status=lecturer.del_status
    )
    db.add(new_lecturer)
    await db.commit()
    await db.refresh(new_lecturer)
    return new_lecturer

@router.get("/lecturers", response_model=list[LecturerOut])
async def get_lecturers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Lecturer))
    return result.scalars().all()

@router.put("/lecturers/{staff_id}", response_model=LecturerOut)
async def update_lecturer(
    staff_id: int,
    lecturer: LecturerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Lecturer).filter(Lecturer.staff_id == staff_id))
    existing_lecturer = result.scalars().first()
    if not existing_lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")

    # Update the lecturer fields
    existing_lecturer.full_name = lecturer.full_name
    existing_lecturer.lecturer_id = lecturer.lecturer_id
    existing_lecturer.email = lecturer.email
    existing_lecturer.department = lecturer.department
    existing_lecturer.phone_number = lecturer.phone_number
    existing_lecturer.address = lecturer.address
    existing_lecturer.active_status = lecturer.active_status
    existing_lecturer.del_status = lecturer.del_status

    db.add(existing_lecturer)
    await db.commit()
    await db.refresh(existing_lecturer)
    return existing_lecturer

@router.delete("/lecturers/{staff_id}", response_model=dict)
async def delete_lecturer(
    staff_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Lecturer).filter(Lecturer.staff_id == staff_id))
    existing_lecturer = result.scalars().first()
    if not existing_lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")

    await db.delete(existing_lecturer)
    await db.commit()
    return {"message": "Lecturer deleted successfully"}

@router.get("/lecturers/{staff_id}", response_model=LecturerOut)
async def get_lecturer(
    staff_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Lecturer).filter(Lecturer.staff_id == staff_id))
    lecturer = result.scalars().first()
    if not lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")
    return lecturer
    