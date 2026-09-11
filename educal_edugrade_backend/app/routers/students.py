from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Student, User
from pydantic import BaseModel
from app.dependencies import get_current_user, get_current_user_role
from typing import Optional, List

router = APIRouter()

# Pydantic schema for Student input/output
class StudentCreate(BaseModel):
    student_id: str
    full_name: str
    email: str
    program_id: int
    level: int
    semester: str
    active_status: Optional[bool] = True
    del_status: Optional[bool] = False

class StudentOut(BaseModel):
    id: int
    student_id: str
    full_name: str
    email: str
    program_id: int
    program_name: str
    level: int
    semester: str
    active_status: bool
    del_status: bool

    class Config:
        from_attributes = True

@router.post("/students", response_model=StudentOut)
async def create_student(
    student: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    new_student = Student(
        student_id=student.student_id,
        full_name=student.full_name,
        email=student.email,
        program_id=student.program_id,
        level=student.level,
        semester=student.semester,
        active_status=student.active_status,
        del_status=student.del_status
    )
    db.add(new_student)
    await db.commit()
    await db.refresh(new_student)
    # Fetch program_name for response
    await db.refresh(new_student)
    program_name = new_student.program.program_name if new_student.program else ""
    return {
        "id": new_student.id,
        "student_id": new_student.student_id,
        "full_name": new_student.full_name,
        "email": new_student.email,
        "program_id": new_student.program_id,
        "program_name": program_name,
        "level": new_student.level,
        "semester": new_student.semester,
        "active_status": new_student.active_status,
        "del_status": new_student.del_status,
    }

@router.get("/students", response_model=List[StudentOut])
async def get_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Student).options(selectinload(Student.program))
    )
    students = result.scalars().all()
    return [
        {
            "id": s.id,
            "student_id": s.student_id,
            "full_name": s.full_name,
            "email": s.email,
            "program_id": s.program_id,
            "program_name": s.program.program_name if s.program else "",
            "level": s.level,
            "semester": s.semester,
            "active_status": s.active_status,
            "del_status": s.del_status,
        }
        for s in students
    ]

@router.put("/students/{id}", response_model=StudentOut)
async def update_student(
    id: int,
    student: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Student).filter(Student.id == id).options(selectinload(Student.program)))
    existing_student = result.scalars().first()
    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing_student.student_id = student.student_id
    existing_student.full_name = student.full_name
    existing_student.email = student.email
    existing_student.program_id = student.program_id
    existing_student.level = student.level
    existing_student.semester = student.semester
    existing_student.active_status = student.active_status
    existing_student.del_status = student.del_status

    db.add(existing_student)
    await db.commit()
    await db.refresh(existing_student)
    program_name = existing_student.program.program_name if existing_student.program else ""
    return {
        "id": existing_student.id,
        "student_id": existing_student.student_id,
        "full_name": existing_student.full_name,
        "email": existing_student.email,
        "program_id": existing_student.program_id,
        "program_name": program_name,
        "level": existing_student.level,
        "semester": existing_student.semester,
        "active_status": existing_student.active_status,
        "del_status": existing_student.del_status,
    }

@router.delete("/students/{id}", response_model=dict)
async def delete_student(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Student).filter(Student.id == id))
    existing_student = result.scalars().first()
    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")

    await db.delete(existing_student)
    await db.commit()
    return {"message": "Student deleted successfully"}

@router.get("/students/{id}", response_model=StudentOut)
async def get_student(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Student).filter(Student.id == id).options(selectinload(Student.program))
    )
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    program_name = student.program.program_name if student.program else ""
    return {
        "id": student.id,
        "student_id": student.student_id,
        "full_name": student.full_name,
        "email": student.email,
        "program_id": student.program_id,
        "program_name": program_name,
        "level": student.level,
        "semester": student.semester,
        "active_status": student.active_status,
        "del_status": student.del_status,
    }