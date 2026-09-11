import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layout";
import { FiUsers, FiClipboard, FiCalendar, FiClock } from "react-icons/fi";
import { getExamStatus } from "../../../utils/examStatus";
import { getExams, getExamById, getSubmissionsForExam } from "../../../services/api"; // <-- Use correct imports
import StatCard from "../../../components/StatCard";

const Dashboard = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    upcomingExams: 0,
    completedExams: 0,
  });

  useEffect(() => {
    // Fetch exams from backend
    const fetchExams = async () => {
      try {
        const fetchedExams = await getExams(); // Should return array of exams from backend
        setExams(fetchedExams);
      } catch (err) {
        setExams([]);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    // Calculate exam statistics
    const examStats = exams.reduce(
      (acc, exam) => {
        acc.totalExams++;
        const status = getExamStatus(exam, exam.id === 1);
        if (status === "available") acc.activeExams++;
        else if (status === "scheduled") acc.upcomingExams++;
        else acc.completedExams++;
        return acc;
      },
      {
        totalExams: 0,
        activeExams: 0,
        upcomingExams: 0,
        completedExams: 0,
      }
    );
    setStats(examStats);
  }, [exams]);

  const statCards: { title: string; value: number; icon: ReactNode; tone: "blue" | "emerald" | "purple" | "amber" }[] = [
    {
      title: "Total Exams",
      value: stats.totalExams,
      icon: <FiClipboard />,
      tone: "blue",
    },
    {
      title: "Active Exams",
      value: stats.activeExams,
      icon: <FiClock />,
      tone: "emerald",
    },
    {
      title: "Upcoming Exams",
      value: stats.upcomingExams,
      icon: <FiCalendar />,
      tone: "purple",
    },
    {
      title: "Completed Exams",
      value: stats.completedExams,
      icon: <FiUsers />,
      tone: "amber",
    },
  ];

  return (
    <DashboardLayout 
      title="Dashboard" 
      showAddHeadbarButton={false}
      buttonTitle=""
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.title}
            value={stat.value}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Recent Exams</h2>
          <Link
            to="/user/l/exams"
            className="text-sm text-primary hover:text-primary/90"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                  Class
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.slice(0, 5).map((exam) => {
                const status = getExamStatus(exam, exam.id === 1);
                const statusColors = {
                  available: "bg-green-100 text-green-700",
                  scheduled: "bg-purple-100 text-purple-700",
                  past: "bg-slate-100 text-slate-700",
                };
                const statusLabels = {
                  available: "Active",
                  scheduled: "Upcoming",
                  past: "Completed",
                };

                return (
                  <tr key={exam.id} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <Link
                        to={`/user/l/exams/details/${exam.id}`}
                        className="text-slate-800 hover:text-primary"
                      >
                        {exam.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {exam.className}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(exam.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
                      >
                        {statusLabels[status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;