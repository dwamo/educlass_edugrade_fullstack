import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout";
import { Exam } from "../../../services/api"; // Use the backend Exam type
import { getExams } from "../../../services/api"; // Use the backend API call
import ExamCard from "../../../components/examCard";

function StudentExams() {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Optionally, filter by student classes if needed
        // For now, fetch all exams and filter on the frontend if needed
        const exams = await getExams();
        setAvailableExams(exams);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
        setAvailableExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <DashboardLayout
      title="My Exams"
      showAddHeadbarButton={false}
      buttonTitle=""
    >
      <div className="mb-6">
        <h2 className="text-lg font-medium text-slate-800 mb-2">
          Available Exams
        </h2>
        <p className="text-sm text-slate-600">
          View and take exams from your enrolled classes
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-slate-600">Loading exams...</div>
        </div>
      ) : availableExams.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-6 text-center">
          <p className="text-slate-600">No exams available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableExams
            .filter((exam) => typeof exam.exam_id === "number")
            .map((exam) => (
              <ExamCard
                key={exam.exam_id}
                id={exam.exam_id as number}
                title={exam.exam_name}
                type={exam.exam_type}
                duration={exam.duration || ""}
                startTime={exam.start_time}
                endTime={exam.end_time}
                dueDate={exam.due_date}
                questionsCount={exam.questions?.length || 0}
                // Add any additional props as needed
              />
            ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default StudentExams;