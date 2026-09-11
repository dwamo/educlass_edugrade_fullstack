from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Program, User
from app.dependencies import get_current_user, get_current_user_role
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Pydantic schema for program input/output
class ProgramCreate(BaseModel):
    program_name: str
    description: Optional[str] = None
    duration: str

class ProgramOut(BaseModel):
    id: int
    program_name: str
    description: Optional[str]
    duration: str
    created_at: datetime

    class Config:
        from_attributes = True

# Create a new program
@router.post("/programs", response_model=ProgramOut)
async def create_program(
    program: ProgramCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    new_program = Program(
        program_name=program.program_name,
        description=program.description,
        duration=program.duration
    )
    db.add(new_program)
    await db.commit()
    await db.refresh(new_program) 
    return new_program

# Get all programs
@router.get("/programs", response_model=List[ProgramOut])
async def get_programs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Program))
    return result.scalars().all()

# Get a single program by ID
@router.get("/programs/{id}", response_model=ProgramOut)
async def get_program(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Program).filter(Program.id == id))
    program = result.scalars().first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program

# Update a program by ID
@router.put("/programs/{id}", response_model=ProgramOut)
async def update_program(
    id: int,
    program: ProgramCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Program).filter(Program.id == id))
    existing_program = result.scalars().first()
    if not existing_program:
        raise HTTPException(status_code=404, detail="Program not found")

    # Update the program fields
    existing_program.program_name = program.program_name
    existing_program.description = program.description
    existing_program.duration = program.duration

    db.add(existing_program)
    await db.commit()
    await db.refresh(existing_program)
    return existing_program

    # Delete a program by ID
@router.delete("/programs/{id}", status_code=204)
async def delete_program(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_role("admin")),
):
    result = await db.execute(select(Program).filter(Program.id == id))
    program = result.scalars().first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    await db.delete(program)
    await db.commit()
    return {"message": "Program deleted successfully"}