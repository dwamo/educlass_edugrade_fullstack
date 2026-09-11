from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import SystemLog, User
from app.dependencies import get_current_user_role
from pydantic import BaseModel, Field
from datetime import datetime

router = APIRouter()

# Pydantic schema for system_logs input/output
class SystemLogCreate(BaseModel):
    activity: str
    user_id: int
    activity_timestamp: datetime = Field(default_factory=datetime.now)

class SystemLogOut(BaseModel):
    log_id: int
    activity: str
    user_id: int
    activity_timestamp: datetime

    class Config:
        from_attributes = True

# Create a new system_log
@router.post("/system_log", response_model=SystemLogOut)
async def create_log(
    system_log: SystemLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    new_log = SystemLog(
        activity=system_log.activity,
        user_id=system_log.user_id,
        activity_timestamp=system_log.activity_timestamp
    )
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log

# Get all system logs
@router.get("/system_log", response_model=list[SystemLogOut])
async def get_system_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(SystemLog))
    return result.scalars().all()
