import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getCourses, deleteCourse, getPrograms, getLecturers } from "../../../services/api"; // API functions
import type { Lecturer as APILecturer } from "../../../services/api"; // Import the correct Lecturer type
import Modal from "../../../components/Modal";
import CourseForm from "./CourseForm";
import ActionsMenu from "../../../components/ActionsMenu";

const CoursesList = () => {
  const navigate = useNavigate();

  interface LocalCourse {
    course_id: number;
    course_code: string;
    course_name: string;
    description: string;
    program_id: number;
    lecturer_id: number;
    credits: number;
  }
  
  const [courses, setCourses] = useState<LocalCourse[]>([]);
  interface Program {
      id: number; // Assuming the API returns 'id' instead of 'course_id'
      program_name: string;
    }

  const [programs, setPrograms] = useState<Program[]>([]);
  const [lecturers, setLecturers] = useState<APILecturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [successMessage, setSuccessMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [coursesData, programsData, lecturersData] = await Promise.all([
        getCourses(),
        getPrograms(),
        getLecturers(),
      ]);
      setCourses(
        coursesData.map((course) => ({
          course_id: course.course_id,
          course_code: course.course_code,
          course_name: course.course_name,
          description: course.description,
          program_id: course.program_id,
          lecturer_id: course.lecturer_id,
          credits: course.credits,
        }))
      );
      setPrograms(
        programsData.map((program) => ({
          id: program.id, // Map the API response to match the updated interface
          program_name: program.program_name,
        }))
      );
      setLecturers(lecturersData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (id: number) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  const handleSaved = () => {
    setIsFormOpen(false);
    setSuccessMessage(editingId ? "Course updated successfully!" : "Course created successfully!");
    fetchData();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Get program name by ID
  const getProgramName = (programId: number): string => {
    const program: Program | undefined = programs.find((p) => p.id === programId);
    return program ? program.program_name : "Unknown Program";
  };

  // Get lecturer name by ID
const getLecturerName = (lecturerId: number): string => {
  const lecturer: APILecturer | undefined = lecturers.find((l) => l.staff_id === lecturerId);
  return lecturer ? lecturer.full_name : "Unknown Lecturer";
};

  // Handle course deletion
  const handleDelete = async (course_id: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(course_id); // API call to delete course
        setCourses((prevCourses: LocalCourse[]) => prevCourses.filter((course: LocalCourse) => course.course_id !== course_id)); // Update state
      } catch (err) {
        console.error("Error deleting course:", err);
        setError("Failed to delete course. Please try again later.");
      }
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Courses</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Course
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Lecturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredCourses.map((course) => (
                <tr key={course.course_id}>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm font-medium text-slate-900">{course.course_code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-900">{course.course_name}</div>
                    <div className="text-sm text-slate-500">{course.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{getProgramName(course.program_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{getLecturerName(course.lecturer_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{course.credits}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <ActionsMenu
                        items={[
                          { label: "View", icon: <FiEye className="h-4 w-4" />, onClick: () => navigate(`/admin/courses/${course.course_id}`) },
                          { label: "Edit", icon: <FiEdit2 className="h-4 w-4" />, onClick: () => openEditForm(course.course_id) },
                          { label: "Delete", icon: <FiTrash2 className="h-4 w-4" />, onClick: () => handleDelete(course.course_id), variant: "danger" },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Courses Found</h3>
            <p className="text-slate-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by adding a new course"}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FiPlus className="mr-2" /> Add Course
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit Course" : "Create Course"}
      >
        <CourseForm id={editingId ?? undefined} onClose={closeForm} onSaved={handleSaved} />
      </Modal>
    </div>
  );
};

export default CoursesList;