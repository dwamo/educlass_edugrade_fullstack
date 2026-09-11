# API Reference

## Authentication

- `POST /api/auth/login`  
  Login with username, password, and role.

## Admin Endpoints

- `GET /api/lecturers`  
  List all lecturers.
- `POST /api/lecturers`  
  Add a new lecturer.
- `GET /api/students`  
  List all students.
- `POST /api/students`  
  Add a new student.
- `GET /api/programs`  
  List programs.
- `POST /api/programs`  
  Add a program.
- `GET /api/courses`  
  List courses.
- `POST /api/courses`  
  Add a course.
- `GET /api/users`  
  List users and roles.

## Lecturer Endpoints

- `GET /api/exams`  
  List exams.
- `POST /api/exams`  
  Create an exam.
- `GET /api/exams/{exam_id}`  
  Get exam details.
- `GET /api/exams/{exam_id}/submissions`  
  View student submissions.
- `POST /api/grading`  
  Grade submissions.

## Student Endpoints

- `GET /api/student/exams`  
  List available exams.
- `GET /api/student/exams/{exam_id}`  
  View/take exam.
- `GET /api/student/results/{student_id}`  
  View exam results summary.
- `GET /api/student/results/{student_id}/{exam_id}`  
  View detailed result for an exam.

---
