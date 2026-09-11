import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout";
import { type Exam } from "../../../services/api";
import { getExams, getCourses, type Course } from "../../../services/api";
import ExamCard from "../../../components/examCard";

const ExamList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "exam" | "assignment">("all");
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [examData, courseData] = await Promise.all([getExams(), getCourses()]);
      setExams(examData);
      setCourses(courseData);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredExams = exams.filter(exam =>
    filter === "all" ? true : exam.exam_type === filter
  );

  // Helper to get course_name by course_id
  const getCourseName = (course_id: number) => {
    const course = courses.find(c => c.course_id === course_id);
    return course ? course.course_name : "Unknown Course";
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Exams"
        buttonTitle="Create Exam"
        showAddHeadbarButton={true}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Exams"
      buttonTitle="Create Exam"
      showAddHeadbarButton={true}
      onAddHeadbarButton={() => navigate("/user/l/exams/create")}
    >
      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "exam"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setFilter("exam")}
          >
            Exams
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "assignment"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setFilter("assignment")}
          >
            Assignments
          </button>
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredExams.map((exam) => (
          <ExamCard
            key={exam.exam_id}
            id={exam.exam_id}
            title={exam.exam_name}
            type={exam.exam_type}
            duration={exam.duration}
            startTime={exam.start_time}
            endTime={exam.end_time}
            dueDate={exam.due_date}
            courseName={getCourseName(exam.course_id)}
            questionsCount={exam.questions.length}
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ExamList;