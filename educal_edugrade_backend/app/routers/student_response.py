from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import StudentResponse, User
from app.dependencies import get_current_user_role
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

router = APIRouter()

class ResponseCreate(BaseModel):
    exam_id: int
    question_id: int
    student_id: int
    response_text: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    # Student-submitted answers are not pre-scored by the client; scoring is
    # assigned by a lecturer/grader afterwards, never accepted at submission time.

@router.post("/responses/bulk")
async def create_responses_bulk(
    responses: List[ResponseCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("student")),
):
    if any(resp.student_id != current_user.student_id for resp in responses):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot submit responses on behalf of another student",
        )
    objs = [
        StudentResponse(
            exam_id=resp.exam_id,
            question_id=resp.question_id,
            student_id=resp.student_id,
            response_text=resp.response_text,
            submitted_at=resp.submitted_at,
        )
        for resp in responses
    ]
    db.add_all(objs)
    await db.commit()
    return {"message": "Responses submitted successfully"}