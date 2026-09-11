from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.auth import create_access_token, verify_password
from app.models import User, Lecturer  # <-- Import Lecturer model
from app.database import get_db

router = APIRouter()

@router.post("/token")
async def login_for_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    result = await db.execute(select(User).filter(User.username == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Default response
    response = {
        "access_token": create_access_token(data={"sub": str(user.user_id), "role": user.role}),
        "role": user.role,
        "token_type": "bearer"
    }

    # If the user is a lecturer, fetch the lecturer_id (staff_id) and add it to the response
    if user.role == "lecturer":
        lecturer_result = await db.execute(select(Lecturer).filter(Lecturer.staff_id == user.lecturer_id))
        lecturer = lecturer_result.scalars().first()
        if lecturer:
            response["lecturer_id"] = lecturer.staff_id  # Assuming staff_id is the primary key for Lecturer

    # If the user is a student, add the student_id to the response
    if user.role == "student" and hasattr(user, "student_id"):
        response["student_id"] = user.student_id

    return response