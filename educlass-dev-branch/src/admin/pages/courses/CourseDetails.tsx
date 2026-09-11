import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { getCourseById, getPrograms, getLecturers } from "../../../services/api";
import Modal from "../../../components/Modal";
import CourseForm from "./CourseForm";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  // Fetch course details, programs, and lecturers
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch course details
      const courseData = await getCourseById(Number(id));
      setCourse(courseData);

      // Fetch programs and lecturers
      const [programsData, lecturersData] = await Promise.all([
        getPrograms(),
        getLecturers(),
      ]);
      setPrograms(programsData);
      setLecturers(lecturersData);
    } catch (err) {
      console.error("Error fetching course details:", err);
      setError("Failed to fetch course details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Get program name by ID
  const getProgramName = (programId: number): string => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.program_name : "Unknown Program";
  };

  // Get lecturer name by ID
  const getLecturerName = (lecturerId: number): string => {
    const lecturer = lecturers.find((l) => l.staff_id === lecturerId);
    return lecturer ? lecturer.full_name : "Unknown Lecturer";
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!course) {
    return <div className="p-6">Course not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/courses")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {course.course_name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Course Code: {course.course_code}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditFormOpen(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
        >
          <FiEdit2 className="w-4 h-4 mr-2" />
          Edit Course
        </button>
      </div>

      {/* Course Details */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200">
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Course Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {course.description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration
                </label>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {course.duration}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Credits
                </label>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {course.credits}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Additional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Program
                </label>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {getProgramName(course.program_id)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lecturer
                </label>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {getLecturerName(course.lecturer_id)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditFormOpen} onClose={() => setIsEditFormOpen(false)} title="Edit Course">
        <CourseForm
          id={course.course_id}
          onClose={() => setIsEditFormOpen(false)}
          onSaved={() => {
            setIsEditFormOpen(false);
            fetchData();
          }}
        />
      </Modal>
    </div>
  );
};

export default CourseDetails;