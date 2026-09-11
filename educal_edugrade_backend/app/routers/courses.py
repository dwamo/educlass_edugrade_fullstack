import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Course, User
from app.dependencies import get_current_user, get_current_user_role
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# Pydantic schema for course input/output
class CourseCreate(BaseModel):
    course_name: str
    course_code: str
    duration: str
    credits: int
    description: str
    lecturer_id: int
    program_id: int

class CourseOut(BaseModel):
    course_id: int
    program_id: int
    course_name: str
    course_code: str
    duration: str
    credits: int
    description: str
    lecturer_id: int

    class Config:
        from_attributes = True

# Create a new course
@router.post("/courses", response_model=CourseOut)
async def create_course(
    course: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    try:
        new_course = Course(
            course_name=course.course_name,
            course_code=course.course_code,
            duration=course.duration,
            credits=course.credits,
            description=course.description,
            lecturer_id=course.lecturer_id,
            program_id=course.program_id
        )
        db.add(new_course)
        await db.commit()
        await db.refresh(new_course)
        return new_course
    except Exception as e:
        logger.exception("Error creating course")
        raise HTTPException(status_code=500, detail="An error occurred while creating the course")

# Update a course by ID
@router.put("/courses/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: int,
    course: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Course).filter(Course.course_id == course_id))
    existing_course = result.scalars().first()
    if not existing_course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Update the course fields
    existing_course.course_name = course.course_name
    existing_course.course_code = course.course_code
    existing_course.duration = course.duration
    existing_course.credits = course.credits
    existing_course.description = course.description
    existing_course.lecturer_id = course.lecturer_id
    existing_course.program_id = course.program_id

    db.add(existing_course)
    await db.commit()
    await db.refresh(existing_course)
    return existing_course

# Delete a course by ID
@router.delete("/courses/{course_id}", status_code=204)
async def delete_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Course).filter(Course.course_id == course_id))
    existing_course = result.scalars().first()
    if not existing_course:
        raise HTTPException(status_code=404, detail="Course not found")

    await db.delete(existing_course)
    await db.commit()
    return {"message": "Course deleted successfully"}

@router.get("/courses", response_model=list[CourseOut])
async def get_courses(
    lecturer_id: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Course)
    if lecturer_id is not None:
        query = query.filter(Course.lecturer_id == lecturer_id)
    result = await db.execute(query)
    return result.scalars().all()