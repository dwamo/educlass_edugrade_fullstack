import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// A 401 means the token is missing, invalid, or expired (tokens last 30
// minutes). Every list/CRUD endpoint now requires auth, so without this the
// UI just silently renders empty lists/"not found" states that look
// indistinguishable from actually having no data.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("username");
      localStorage.removeItem("staff_id");
      localStorage.removeItem("student_id");
      sessionStorage.setItem("sessionExpired", "1");
      if (window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }
    return Promise.reject(error);
  }
);

// Uploaded avatars come back as a path relative to the backend (e.g.
// "/uploads/avatars/user_5_ab12cd34.png"); resolve it against the API origin
// so <img src> works regardless of which port the frontend itself runs on.
export const resolveAssetUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// -------------------- USERS --------------------
interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  lecturer_id?: number | null;
  student_id?: number | null;
  profile_image?: string | null;
}

interface UserInput {
  username: string;
  email: string;
  password: string;
  role: string;
  lecturer_id?: number;
  student_id?: number;
}

export interface ProfileUpdateInput {
  username: string;
  email: string;
  password?: string;
}

export const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>(`/users/me`);
  return response.data;
};

export const updateMyProfile = async (data: ProfileUpdateInput): Promise<User> => {
  const response = await apiClient.put<User>(`/users/me`, data);
  return response.data;
};

export const uploadMyAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<User>(`/users/me/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadUserAvatar = async (userId: number, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<User>(`/users/${userId}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getUsers = async (role?: string): Promise<User[]> => {
  const response = await apiClient.get<User[]>(`/users/`, {
    params: role ? { role } : undefined,
  });
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: UserInput): Promise<User> => {
  const response = await apiClient.post<User>(`/users/`, userData);
  return response.data;
};

export const updateUser = async (id: number, userData: UserInput): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
  return response.data;
};

// -------------------- LECTURERS --------------------
interface Lecturer {
  staff_id: number;
  lecturer_id: string;
  full_name: string;
  email: string;
  department: string;
  phone_number: string;
  address: string;
  active_status: boolean;
  del_status: boolean;
}

export const getLecturers = async (): Promise<Lecturer[]> => {
  const response = await apiClient.get<Lecturer[]>(`/lecturers`);
  return response.data;
};

export const getLecturerById = async (staffId: number): Promise<Lecturer> => {
  const response = await apiClient.get<Lecturer>(`/lecturers/${staffId}`);
  return response.data;
};

export const createLecturer = async (lecturerData: Omit<Lecturer, "staff_id">): Promise<Lecturer> => {
  const response = await apiClient.post<Lecturer>(`/lecturers`, lecturerData);
  return response.data;
};

export const updateLecturer = async (staffId: number, lecturerData: Partial<Lecturer>): Promise<Lecturer> => {
  const response = await apiClient.put<Lecturer>(`/lecturers/${staffId}`, lecturerData);
  return response.data;
};

export const deleteLecturer = async (staffId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/lecturers/${staffId}`);
  return response.data;
};


// -------------------- STUDENTS --------------------
interface Student {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  program_id: number; // <-- Use program_id instead of program
  program_name: string;
  level: number;
  semester: string;
  active_status: boolean;
  del_status: boolean;
}

export const getStudents = async (): Promise<Student[]> => {
  const response = await apiClient.get<Student[]>(`/students`);
  return response.data;
};

export const getStudentById = async (id: number): Promise<Student> => {
  const response = await apiClient.get<Student>(`/students/${id}`);
  return response.data;
};

export const createStudent = async (studentData: Omit<Student, "id">): Promise<Student> => {
  const response = await apiClient.post<Student>(`/students`, studentData);
  return response.data;
};

export const updateStudent = async (id: number, studentData: Partial<Student>): Promise<Student> => {
  const response = await apiClient.put<Student>(`/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/students/${id}`);
  return response.data;
};

// -------------------- STUDENT RESPONSES --------------------
export interface Submission {
  id: string;
  studentId: number;
  answer: string;
  score: number;
  status: "graded" | "pending" | "in_progress";
  feedback: string;
  aiFeedback: string;
  manuallyGraded: boolean;
  lastModified: string;
  needsStatus?: "needs_attention" | "its_fine" | "not_processed";
}

export interface StudentResponse {
  response_id?: number;
  exam_id: number;
  question_id: number;
  student_id: number;
  response_text: string;
  submitted_at?: string;
  score?: number | null;
}

// Submit a single student response
export const submitStudentResponse = async (
  response: Omit<StudentResponse, "response_id" | "submitted_at" | "score">
): Promise<StudentResponse> => {
  const res = await apiClient.post<StudentResponse>(`/responses`, response);
  return res.data;
};

// Submit multiple responses at once (if your backend supports it)
export const submitStudentResponses = async (
  responses: Array<any>
): Promise<any> => {
  // Send as { responses: [...] }
  const res = await apiClient.post(`/responses/bulk`, { responses });
  return res.data;
};

// Get all student responses
export const getStudentResponses = async (): Promise<StudentResponse[]> => {
  const res = await apiClient.get<StudentResponse[]>(`/responses`);
  return res.data;
};

// Get submissions for a specific exam (and optionally question)
export const getSubmissionsForExam = async (
  examId: number,
  questionId?: number
): Promise<Submission[]> => {
  const responses = await getStudentResponses();
  // Filter and map to Submission type for frontend
  return responses
    .filter(r => r.exam_id === examId && (questionId ? r.question_id === questionId : true))
    .map(r => ({
      id: String(r.response_id ?? `${r.exam_id}-${r.question_id}-${r.student_id}`),
      question_id: r.question_id, // <-- Ensure this is present
      studentId: Number(r.student_id),
      answer: r.response_text,
      score: r.score ?? 0,
      status: r.score != null ? "graded" : "pending",
      feedback: "",
      aiFeedback: "",
      manuallyGraded: false,
      lastModified: r.submitted_at ?? "",
      needsStatus: "not_processed",
    }));
};

// -------------------- QUESTIONS --------------------
export const getQuestions = async () => {
  const response = await apiClient.get("/questions");
  return response.data;
};
// -------------------- COURSES --------------------
interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  description: string;
  program_id: number; // Foreign key to programs
  lecturer_id: number; // Foreign key to lecturers
  credits: number;
  duration: string; // e.g., "1 semester"
  //status: string; // e.g., "active" or "inactive"
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>(`/courses`);
  return response.data;
};

export const getCourseById = async (id: number): Promise<Course> => {
  const response = await apiClient.get<Course>(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (courseData: Omit<Course, "id">): Promise<Course> => {
  const response = await apiClient.post<Course>(`/courses`, courseData);
  return response.data;
};

export const updateCourse = async (id: number, courseData: Partial<Course>): Promise<Course> => {
  const response = await apiClient.put<Course>(`/courses/${id}`, courseData);
  return response.data;
};

export const deleteCourse = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/courses/${id}`);
  return response.data;
};

// Get courses by lecturer (for use in CreateExam)
export const getCoursesByLecturer = async (lecturerId: string | number): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>(`/courses`, {
    params: { lecturer_id: lecturerId }
  });
  return response.data;
};

// -------------------- PROGRAMS --------------------
interface Program {
  id: number;
  program_name: string;
  description: string;
  duration: string;
}

export const getPrograms = async (): Promise<Program[]> => {
  const response = await apiClient.get<Program[]>(`/programs`);
  return response.data;
};

export const getProgramById = async (id: number): Promise<Program> => {
  const response = await apiClient.get<Program>(`/programs/${id}`);
  return response.data;
};

export const createProgram = async (programData: Omit<Program, "id">): Promise<Program> => {
  const response = await apiClient.post<Program>(`/programs`, programData);
  return response.data;
};

export const updateProgram = async (id: number, programData: Partial<Program>): Promise<Program> => {
  const response = await apiClient.put<Program>(`/programs/${id}`, programData);
  return response.data;
};

export const deleteProgram = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/programs/${id}`);
  return response.data;
};   

// -------------------- EXAMS --------------------
export interface Exam {
  exam_id?: number;
  course_id: number;
  exam_name: string;
  exam_type: string;
  exam_desc: string;
  due_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  duration_minutes: number;
  duration?: string;
  created_by?: number;
  questions: Question[];
}

export interface Question {
  question_id?: number;
  question_text: string;
  question_type: string;
  expected_answer?: string;
  points: number;
  options?: string[];
  rubric_criteria?: any[];
  order_index?: number;
}

// Get all exams
export const getExams = async (): Promise<Exam[]> => {
  const response = await apiClient.get<Exam[]>(`/exams`);
  return response.data;
};

// Get single exam
export const getExamById = async (id: number): Promise<Exam> => {
  const response = await apiClient.get<Exam>(`/exams/${id}`);
  return response.data;
};

// Create exam
export const createExam = async (examData: Omit<Exam, "exam_id" | "created_by">): Promise<Exam> => {
  const response = await apiClient.post<Exam>(`/exams`, examData);
  return response.data;
};

// Update exam
export const updateExam = async (id: number, examData: Partial<Exam>): Promise<Exam> => {
  const response = await apiClient.put<Exam>(`/exams/${id}`, examData);
  return response.data;
};

// Delete exam
export const deleteExam = async (id: number): Promise<void> => {
  await apiClient.delete(`/exams/${id}`);
};

// Define the answer payload type
export interface ExamAnswerPayload {
  question_id: number;
  answer: string;
}

// Submit student's answers for an exam (legacy, if needed)
export const submitExamAnswers = async (
  examId: number,
  answers: ExamAnswerPayload[]
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `/exams/${examId}/submit`,
    { answers }
  );
  return response.data;
};

// -------------------- UTILS --------------------
// Helper to format duration for frontend display
export function formatDuration(exam: any) {
  if (exam.duration) return exam.duration;
  if (exam.duration_hours || exam.duration_minutes) {
    const h = exam.duration_hours || 0;
    const m = exam.duration_minutes || 0;
    return `${h ? `${h}h` : ""}${h && m ? " " : ""}${m ? `${m}m` : ""}`.trim();
  }
  return "-";
}

// -------------------- AI GRADING --------------------
export const aiGradeEssay = async ({
  question,
  expected_answer,
  student_answer,
  rubric_criteria,
}: {
  question: string;
  expected_answer: string;
  student_answer: string;
  rubric_criteria: any;
}) => {
  const response = await apiClient.post("/ai-grade", {
    question,
    expected_answer,
    student_answer,
    rubric_criteria
  });
  return response.data;
};

// ...existing code...
export const saveAIGradingFeedback = async (responseId: string | number, aiResult: any) => {
  return apiClient.post(`/responses/${responseId}/ai-feedback`, aiResult);
};

export interface StudentExamResult {
  id: string;
  title: string;
  className: string;
  type: string;
  startTime: string;
  endTime: string;
  dueDate: string;
  totalPoints: number;
  score: number;
  grade: string;
}

export const getStudentResults = async (studentId: number): Promise<StudentExamResult[]> => {
  const response = await apiClient.get<StudentExamResult[]>(`/student/results/${studentId}`);
  return response.data;
};