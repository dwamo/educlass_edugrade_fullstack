import { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import ClassCard from "../../../components/classCard";
import { getCoursesByLecturer } from "../../../services/api"; // <-- Use the API function
import { Course } from "../../../services/api"; // <-- Use the Course type from api.tsx
import { FiBook } from "react-icons/fi";

function ClassIndex() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        // Get lecturerId from localStorage or auth context if available
        const lecturerId = localStorage.getItem("staff_id") || 1;
        const lecturerCourses = await getCoursesByLecturer(lecturerId);
        setCourses(lecturerCourses);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <DashboardLayout
        title="Classes"
        showAddHeadbarButton={false}
        buttonTitle=""
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBook className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Classes</h3>
          <p className="text-slate-600">Please wait while we fetch your classes.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Classes"
      showAddHeadbarButton={false}
      buttonTitle=""
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {courses.map((course) => (
          <ClassCard
            key={course.course_id}
            code={course.course_code}
            name={course.course_name}
            level={course.credits?.toString() || ""}
            status="Active"
            semester={course.duration}
            instructorId={`LEC${String(course.lecturer_id).padStart(3, '0')}`}
            description={course.description}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

export default ClassIndex;