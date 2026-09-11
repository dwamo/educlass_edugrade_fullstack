from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Exam, Question, Course, User
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time
from app.dependencies import get_current_user, get_current_user_role
from fastapi import status
from sqlalchemy import delete as sqlalchemy_delete
from sqlalchemy.orm import selectinload
from fastapi import Body
from sqlalchemy import select, and_


router = APIRouter()

# --- Pydantic Schemas ---

class RubricCriteria(BaseModel):
    name: str
    value: int
    description: Optional[str] = None

class QuestionBase(BaseModel):
    question_text: str
    question_type: str
    expected_answer: Optional[str] = None
    points: float
    options: Optional[List[str]] = None
    rubric_criteria: Optional[List[RubricCriteria]] = None
    order_index: Optional[int] = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionOut(QuestionBase):
    question_id: int

    class Config:
        from_attributes = True

class ExamBase(BaseModel):
    course_id: int
    exam_name: str
    exam_type: str
    exam_desc: str
    due_date: date
    start_time: time
    end_time: time
    duration_hours: int
    duration_minutes: int
    duration: Optional[str] = None

class ExamCreate(ExamBase):
    created_by: Optional[int] = None
    questions: List[QuestionCreate]

class ExamOut(ExamBase):
    exam_id: int
    created_by: int
    questions: List[QuestionOut]

    class Config:
        from_attributes = True

class ExamSubmission(BaseModel):
    answers: List[dict]  # Each dict: {"question_id": int, "answer": str}

# --- Endpoints ---

@router.post("/exams", response_model=ExamOut)
async def create_exam(
    exam: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("lecturer"))
):
    new_exam = Exam(
        course_id=exam.course_id,
        exam_name=exam.exam_name,
        exam_type=exam.exam_type,
        exam_desc=exam.exam_desc,
        due_date=exam.due_date,
        start_time=exam.start_time,
        end_time=exam.end_time,
        duration_hours=exam.duration_hours,
        duration_minutes=exam.duration_minutes,
        duration=exam.duration,
        created_by=current_user.user_id,
    )
    new_exam.questions = [
        Question(
            question_text=q.question_text,
            question_type=q.question_type,
            expected_answer=q.expected_answer,
            points=q.points,
            options=q.options,
            rubric_criteria=[c.dict() for c in q.rubric_criteria] if q.rubric_criteria else None,
            order_index=q.order_index,
        )
        for q in exam.questions
    ]
    db.add(new_exam)
    await db.commit()
    # Re-fetch with selectinload to ensure questions are loaded
    result = await db.execute(
        select(Exam).options(selectinload(Exam.questions)).where(Exam.exam_id == new_exam.exam_id)
    )
    exam_with_questions = result.scalars().first()
    return exam_with_questions

@router.put("/exams/{exam_id}", response_model=ExamOut)
async def update_exam(
    exam_id: int,
    exam: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("lecturer"))
):
    # Eagerly load questions to avoid async/sync issues
    result = await db.execute(
        select(Exam).options(selectinload(Exam.questions)).where(Exam.exam_id == exam_id)
    )
    db_exam = result.scalars().first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Update exam fields
    db_exam.course_id = exam.course_id
    db_exam.exam_name = exam.exam_name
    db_exam.exam_type = exam.exam_type
    db_exam.exam_desc = exam.exam_desc
    db_exam.due_date = exam.due_date
    db_exam.start_time = exam.start_time
    db_exam.end_time = exam.end_time
    db_exam.duration_hours = exam.duration_hours
    db_exam.duration_minutes = exam.duration_minutes
    db_exam.duration = exam.duration
    db_exam.created_by = current_user.user_id

    # Remove existing questions
    db_exam.questions.clear()
    await db.flush()

    # Add updated questions
    db_exam.questions = [
        Question(
            question_text=q.question_text,
            question_type=q.question_type,
            expected_answer=q.expected_answer,
            points=q.points,
            options=q.options,
            rubric_criteria=[c.dict() for c in q.rubric_criteria] if q.rubric_criteria else None,
            order_index=q.order_index,
        )
        for q in exam.questions
    ]

    await db.commit()
    # Re-fetch with selectinload to ensure questions are loaded
    result = await db.execute(
        select(Exam).options(selectinload(Exam.questions)).where(Exam.exam_id == db_exam.exam_id)
    )
    exam_with_questions = result.scalars().first()
    return exam_with_questions

@router.get("/exams", response_model=List[ExamOut])
async def get_exams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If the user is a lecturer, filter exams by their lecturer_id
    if current_user.role == "lecturer":
        lecturer_id = current_user.lecturer_id
        if not lecturer_id:
            return []
        result = await db.execute(
            select(Exam)
            .join(Course, Exam.course_id == Course.course_id)
            .options(selectinload(Exam.questions))
            .where(Course.lecturer_id == lecturer_id)
        )
        exams = result.scalars().unique().all()
        return exams
    # If the user is a student, filter exams by their program/courses
    elif current_user.role == "student":
        student_pk = current_user.student_id
        print("Student PK from user:", student_pk)
        if not student_pk:
            return []
        from app.models import Student
        student_result = await db.execute(
            select(Student).where(Student.id == student_pk)
        )
        student = student_result.scalars().first()
        print("Student record:", student)
        if not student:
            return []
        program_id = student.program_id
        print("Student program_id:", program_id)
        course_result = await db.execute(
            select(Course.course_id).where(Course.program_id == program_id)
        )
        course_ids = [row[0] for row in course_result.all()]
        print("Course IDs for program:", course_ids)
        if not course_ids:
            return []
        result = await db.execute(
            select(Exam)
            .options(selectinload(Exam.questions))
            .where(Exam.course_id.in_(course_ids))
        )
        exams = result.scalars().unique().all()
        print("Exams found:", exams)
        return exams
    else:
        # For admin or others, return all exams
        result = await db.execute(
            select(Exam).options(selectinload(Exam.questions))
        )
        exams = result.scalars().unique().all()
        return exams

@router.get("/exams/{exam_id}", response_model=ExamOut)
async def get_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Exam).options(selectinload(Exam.questions)).where(Exam.exam_id == exam_id)
    )
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@router.delete("/exams/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("lecturer"))
):
    result = await db.execute(select(Exam).where(Exam.exam_id == exam_id))
    db_exam = result.scalars().first()
    if not db_exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    await db.delete(db_exam)
    await db.commit()
    return None

@router.post("/exams/{exam_id}/submit")
async def submit_exam_answers(
    exam_id: int,
    submission: ExamSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("student"))
):
    # Save answers to DB, grade if auto-gradable, etc.
    # For now, just acknowledge receipt
    return {"message": "Exam answers submitted successfully."}