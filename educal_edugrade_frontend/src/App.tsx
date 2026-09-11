import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./login";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./admin/layout";
import Users from "./admin/pages/users/Users";

// Admin imports
import AdminDashboard from "./admin/pages/Dashboard";
import CoursesList from "./admin/pages/courses/CoursesList";
import AnalyticsPage from "./admin/pages/analytics/AnalyticsPage";
import StudentAnalytics from "./admin/pages/analytics/StudentAnalytics";
import CourseAnalytics from "./admin/pages/analytics/CourseAnalytics";
import ProgramList from "./admin/pages/programs/ProgramList";
import ProgramDetails from "./admin/pages/programs/ProgramDetails";
import LecturerList from "./admin/pages/lecturers/LecturerList";
import StudentList from "./admin/pages/students/StudentList";
import CourseDetails from "./admin/pages/courses/CourseDetails";

// Lecturer imports
import Dashboard from "./user/l/dashboard";
import LecturerSchedule from "./user/l/schedules/";
import LecturerExams from "./user/l/exams/";
import LecturerGrading from "./user/l/grading/";
import LecturerSettings from "./user/l/settings";
import LecturerClass from "./user/l/class";
import ExamDetailsPage from "./user/l/exams/details";
import CreateExam from "./user/l/exams/create";

// Student imports
import StudentDashboard from "./user/s/dashboard";
import StudentExams from "./user/s/exams";
import StudentSettings from "./user/s/settings";
import StudentExamDetails from "./user/s/exams/details";
import StudentExamTake from "./user/s/exams/take";
import StudentResults from "./user/s/results";
import StudentResultDetails from "./user/s/results/details";
import StudentCalender from "./user/s/schedules";
import StudentClasses from "./user/s/classes";
import React from "react";

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log error info here if needed
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1>Something went wrong.</h1>
          <p>Please refresh the page or contact support if the problem persists.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminRoutes = () => (
  <AdminLayout title="Admin Dashboard">
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="programs" element={<ProgramList />} />
      <Route path="programs/:id" element={<ProgramDetails />} />
      <Route path="lecturers" element={<LecturerList />} />
      <Route path="students" element={<StudentList />} />
      <Route path="courses" element={<CoursesList />} />
      <Route path="/admin/courses/:id" element={<CourseDetails />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="analytics/students" element={<StudentAnalytics />} />
      <Route path="analytics/courses" element={<CourseAnalytics />} />
      <Route path="users" element={<Users />} />
    </Routes>
  </AdminLayout>
);

const LecturerRoutes = () => (
  <Routes>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="schedules" element={<LecturerSchedule />} />
    <Route path="exams" element={<LecturerExams />} />
    <Route path="exams/create" element={<CreateExam />} />
    <Route path="exams/create/:id" element={<CreateExam />} />
    <Route path="exams/details/:id" element={<ExamDetailsPage />} />
    <Route path="grading" element={<LecturerGrading />} />
    <Route path="settings" element={<LecturerSettings />} />
    <Route path="class" element={<LecturerClass />} />
  </Routes>
);

const StudentRoutes = () => (
  <Routes>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<StudentDashboard />} />
    <Route path="schedules" element={<StudentCalender />} />
    <Route path="exams" element={<StudentExams />} />
    <Route path="exams/take/:id" element={<StudentExamTake />} />
    <Route path="exams/details/:id" element={<StudentExamDetails />} />
    <Route path="results" element={<StudentResults />} />
    <Route path="results/:examId" element={<StudentResultDetails />} />
    <Route path="classes" element={<StudentClasses />} />
    <Route path="settings" element={<StudentSettings />} />
  </Routes>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Lecturer Routes */}
      <Route
        path="/user/l/*"
        element={
          <ProtectedRoute allowedRoles={["lecturer"]}>
            <LecturerRoutes />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/user/s/*"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentRoutes />
          </ProtectedRoute>
        }
      />

      {/* Catch-All Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;