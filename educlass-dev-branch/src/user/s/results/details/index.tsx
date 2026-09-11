import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import DashboardLayout from "../../layout";
import { formatExamTime } from "../../../../utils/exam";
import { getStudentResults } from "../../../../services/api";

interface RubricScore {
  name: string;
  value: number;
  description: string;
  score: number;
}

interface Question {
  id: string;
  type: "essay" | "multi-choice" | "fill-ins";
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  points: number;
  score: number;
  isCorrect?: boolean;
  feedback?: string;
  rubricScores?: RubricScore[];
}

interface ExamResult {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  dueDate: string;
  totalPoints: number;
  score: number;
  grade: string;
  // Optionally, add questions if your backend provides them
  questions?: Question[];
}

function StudentResultDetails() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentIdStr = localStorage.getItem("student_id");
        const studentId = studentIdStr ? Number(studentIdStr) : undefined;
        if (!studentId) {
          setExamResult(null);
          setLoading(false);
          return;
        }
        const results = await getStudentResults(studentId);
        const found = results.find((r) => String(r.id) === String(examId));
        setExamResult(found || null);
      } catch {
        setExamResult(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const goBack = () => {
    navigate("/user/s/results");
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading Results...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!examResult) {
    return (
      <DashboardLayout title="Results Not Found">
        <div className="text-center py-8">
          <p className="text-slate-500">The exam results you're looking for don't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Exam Results Details" buttonTitle="">
      <div className="mb-4">
        <button
          onClick={goBack}
          className="inline-flex items-center text-primary hover:underline"
        >
          <FiArrowLeft className="mr-1" /> Back to Results
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {examResult.title}
          </h1>
          <p className="text-slate-600 mb-6">
            {examResult.type === "exam" ? "Exam" : "Assignment"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm text-slate-500 mb-1">Score</h3>
              <p
                className={`text-3xl font-bold ${examResult.score >= 60 ? "text-blue-600" : "text-red-600"}`}
              >
                {examResult.score}%
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm text-slate-500 mb-1">Time Taken</h3>
              <p className="text-xl font-semibold text-slate-800 flex items-center">
                <FiClock className="mr-2 text-slate-400" />
                {formatExamTime(examResult.startTime + " - " + examResult.endTime)}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm text-slate-500 mb-1">Date Taken</h3>
              <p className="text-xl font-semibold text-slate-800 flex items-center">
                <FiCalendar className="mr-2 text-slate-400" />
                {examResult.dueDate}
              </p>
            </div>
          </div>

          {/* If you have per-question details, render them here */}
          {/* <h2 className="text-xl font-bold text-slate-800 mb-4">
            Questions & Answers
          </h2>
          <div className="space-y-6">
            {examResult.questions?.map((q, index) => (
              <div key={index}> ... </div>
            ))}
          </div> */}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudentResultDetails;