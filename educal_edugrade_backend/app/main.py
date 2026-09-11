import logging
import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, get_db
from app.models import Base
from app.routers import lecturers, students, exams, courses, users, student_response, questions, system_logs, auth, programs

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Uploaded avatars are served straight off disk. The directory is created by
# the users router on import; mounted here so /uploads/avatars/<file> resolves.
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Add CORS middleware
_default_origins = "http://localhost:5173"
allow_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (only for the first-time setup)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup_event():
    await init_db()

# Register the router
app.include_router(users.router, prefix="", tags=["Users"])
app.include_router(courses.router, prefix="", tags=["Courses"])
app.include_router(exams.router, prefix="", tags=["Exams"])
app.include_router(lecturers.router, prefix="", tags=["Lecturers"])
app.include_router(students.router, prefix="", tags=["Students"])
app.include_router(student_response.router, prefix="/api", tags=["StudentResponse"])
app.include_router(questions.router, prefix="", tags=["Questions"])
app.include_router(system_logs.router, prefix="", tags=["SystemLogs"])
app.include_router(auth.router, prefix="", tags=["Auth"])
app.include_router(programs.router, prefix="", tags=["Programs"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Merged System API!"}

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error while processing %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"message": "An internal error occurred. Please try again later."},
    )
#For testing purposes, you can use this endpoint to check if the server is running.
@app.get("/ping")
def ping():
    return {"msg": "pong"}