import { useState, useEffect } from "react";
import DashboardLayout from "../layout";
import { FiClock, FiCalendar, FiBook, FiCheckCircle } from "react-icons/fi";
import StatCard from "../../../components/StatCard";

function Dashboard() {

  const [stats, setStats] = useState({
    upcomingExams: 0,
    completedAssignments: 0,
    totalCourses: 0,
    examAverage: 0
  });

  useEffect(() => {
    // Simulate getting data from API
    setStats({
      upcomingExams: 3,
      completedAssignments: 8,
      totalCourses: 4,
      examAverage: 85
    });
  }, []);

  return (
    <DashboardLayout
      title="Student Dashboard"
      showAddHeadbarButton={false}
      buttonTitle=""
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
        <StatCard label="Upcoming Exams" value={stats.upcomingExams} tone="blue" icon={<FiClock />} />
        <StatCard label="Completed Assignments" value={stats.completedAssignments} tone="amber" icon={<FiCheckCircle />} />
        <StatCard label="Total Courses" value={stats.totalCourses} tone="emerald" icon={<FiBook />} />
        <StatCard label="Exam Average" value={`${stats.examAverage}%`} tone="purple" icon={<FiCalendar />} />
      </div>

      {/* Main content area - placeholder for dashboard content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Welcome to Your Student Dashboard</h2>
        <p className="text-slate-600">Here you can view your courses, upcoming exams, and academic progress.</p>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;