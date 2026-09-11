from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Question, User
from app.dependencies import get_current_user, get_current_user_role
from pydantic import BaseModel


router = APIRouter()

# Pydantic schema for Question input/output
class QuestionCreate(BaseModel):
    exam_id: int
    question_text: str
    question_type: str
    expected_answer: str
    points: float

class QuestionOut(BaseModel):
    question_id: int
    exam_id: int
    question_text: str
    question_type: str
    expected_answer: str
    points: float

    class Config:
        from_attributes = True

# Create a new Question
@router.post("/questions", response_model=QuestionOut)
async def create_question(
    question: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("lecturer")),
):
    new_question = Question(
        question_text=question.question_text,
        exam_id=question.exam_id,
        question_type=question.question_type,
        expected_answer=question.expected_answer,
        points=question.points
    )
    db.add(new_question)
    await db.commit()
    await db.refresh(new_question)
    return new_question

# Get all Questions
@router.get("/questions", response_model=list[QuestionOut])
async def get_questions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Question))
    return result.scalars().all()
