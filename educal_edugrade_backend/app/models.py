from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Time, Float, Boolean, ForeignKey, TIMESTAMP, JSON
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()

# Program Model
class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    program_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(10), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationship to courses
    courses = relationship("Course", back_populates="program")
    # Relationship to students
    students = relationship("Student", back_populates="program")


# Student Model
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(20), nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False, index=True)
    level = Column(Integer, nullable=False)
    semester = Column(String(255), nullable=False)
    active_status = Column(Boolean, nullable=False)
    del_status = Column(Boolean, nullable=False)

    # Relationship to users
    user = relationship("User", back_populates="student", uselist=False)
    # Relationship to program
    program = relationship("Program", back_populates="students")
    # Relationship to student_responses
    responses = relationship("StudentResponse", back_populates="student")


# Lecturer Model
class Lecturer(Base):
    __tablename__ = "lecturers"

    staff_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lecturer_id = Column(String(20), nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    department = Column(String(255), nullable=False)
    phone_number = Column(String(15), nullable=False, unique=True)
    address = Column(String(255), nullable=False)
    active_status = Column(Boolean, nullable=False)
    del_status = Column(Boolean, nullable=False)

    # Relationship to users
    users = relationship("User", back_populates="lecturer")
    # Relationship to courses
    courses = relationship("Course", back_populates="lecturer")


# User Model
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(10), nullable=False)
    lecturer_id = Column(Integer, ForeignKey("lecturers.staff_id"), nullable=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True, index=True)
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lecturer = relationship("Lecturer", back_populates="users", lazy="joined")
    student = relationship("Student", back_populates="user", lazy="joined")


# Course Model
class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(100), nullable=False)
    course_code = Column(String(10))
    duration = Column(String(10), nullable=True)
    credits = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    lecturer_id = Column(Integer, ForeignKey("lecturers.staff_id"), index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), index=True)

    lecturer = relationship("Lecturer", back_populates="courses")
    program = relationship("Program", back_populates="courses")
    exams = relationship("Exam", back_populates="course")


# Exam Model
class Exam(Base):
    __tablename__ = "exams"

    exam_id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False, index=True)
    exam_name = Column(String(100), nullable=False)
    exam_type = Column(String(20), nullable=False)  # "exam" or "assignment"
    exam_desc = Column(Text, nullable=False)
    due_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    duration_hours = Column(Integer, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    duration = Column(String(20), nullable=True)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)

    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    course = relationship("Course", back_populates="exams")


# Question Model
class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.exam_id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(20), nullable=False)  # 'essay', 'multi-choice', 'fill-ins'
    expected_answer = Column(Text, nullable=True)
    points = Column(Float, nullable=False)
    options = Column(JSON, nullable=True)  # Array of strings for multi-choice
    rubric_criteria = Column(JSON, nullable=True)  # Array of objects for essay
    order_index = Column(Integer, default=0)

    exam = relationship("Exam", back_populates="questions")
    responses = relationship("StudentResponse", back_populates="question")


# StudentResponse Model
class StudentResponse(Base):
    __tablename__ = "student_responses"

    response_id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.exam_id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.question_id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    response_text = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="responses")
    question = relationship("Question", back_populates="responses")
    exam = relationship("Exam")


# SystemLog Model
class SystemLog(Base):
    __tablename__ = "system_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), index=True)
    activity = Column(String(255), nullable=False)
    activity_timestamp = Column(DateTime(timezone=True), server_default=func.now())