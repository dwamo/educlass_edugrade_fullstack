import React, { useState, useEffect } from "react";
import { createCourse, updateCourse, getCourseById, getPrograms, getLecturers } from "../../../services/api";

interface CourseFormProps {
  id?: number;
  onClose: () => void;
  onSaved: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ id, onClose, onSaved }) => {
  const isEditMode = id != null;

  const [programs, setPrograms] = useState<{ id: number; program_name: string }[]>([]);
  const [lecturers, setLecturers] = useState<{ staff_id: number; full_name: string }[]>([]);
  const [formData, setFormData] = useState({
    course_id: 0, // Default value for course_id
    course_name: "",
    course_code: "",
    description: "",
    program_id: 0, // Default value for program_id
    lecturer_id: 0, // Default value for lecturer_id
    credits: 0, // Default value for credits
    duration: "", // Default value for duration
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch programs, lecturers, and course data (if in edit mode)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch programs
        const programsData = await getPrograms();
        setPrograms(programsData);

        // Fetch lecturers
        const lecturersData = await getLecturers();
        setLecturers(lecturersData);

        // If in edit mode, fetch course data
        if (isEditMode && id) {
          const course = await getCourseById(id);
          setFormData({
            course_id: course.course_id,
            course_name: course.course_name,
            course_code: course.course_code,
            description: course.description,
            program_id: course.program_id,
            lecturer_id: course.lecturer_id,
            credits: course.credits,
            duration: course.duration, // Include duration
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, id]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "program_id" || name === "lecturer_id" || name === "credits" ? Number(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateCourse(id, formData);
      } else {
        await createCourse(formData);
      }
      onSaved();
    } catch (err) {
      console.error("Error saving course:", err);
      setError("Failed to save course. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Program Selection */}
            <div>
              <label
                htmlFor="program_id"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Program
              </label>
              <select
                id="program_id"
                name="program_id"
                value={formData.program_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value={0}>Select a program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.program_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lecturer Selection */}
            <div>
              <label
                htmlFor="lecturer_id"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Lecturer
              </label>
              <select
                id="lecturer_id"
                name="lecturer_id"
                value={formData.lecturer_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value={0}>Select a lecturer</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.staff_id} value={lecturer.staff_id}>
                    {lecturer.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Code */}
            <div>
              <label
                htmlFor="course_code"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Course Code
              </label>
              <input
                type="text"
                id="course_code"
                name="course_code"
                value={formData.course_code}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter course code"
              />
            </div>

            {/* Course Name */}
            <div>
              <label
                htmlFor="course_name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Course Name
              </label>
              <input
                type="text"
                id="course_name"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter course name"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter course description"
              />
            </div>

            {/* Credits */}
            <div>
              <label
                htmlFor="credits"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Credits
              </label>
              <input
                type="number"
                id="credits"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter course credits"
              />
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter course duration (e.g., 6 weeks)"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60"
            >
              {loading ? "Saving..." : isEditMode ? "Update Course" : "Create Course"}
            </button>
          </div>
        </form>
    </div>
  );
};

export default CourseForm;