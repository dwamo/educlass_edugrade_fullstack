import React, { useState, useEffect } from "react";
import { getStudentById, createStudent, updateStudent, getPrograms } from "../../../services/api";

interface StudentFormProps {
  id?: number;
  onClose: () => void;
  onSaved: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ id, onClose, onSaved }) => {
  const isEditMode = id != null;

  const [formData, setFormData] = useState({
    student_id: "",
    full_name: "",
    email: "",
    program_id: "",
    level: "",
    semester: "",
    active_status: true,
    del_status: false,
  });

  const [programs, setPrograms] = useState<{ id: number; program_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all programs for the select dropdown
    getPrograms().then((data) => setPrograms(data));
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      if (isEditMode && id) {
        setLoading(true);
        setError("");
        try {
          const student = await getStudentById(id);
          setFormData({
            student_id: student.student_id,
            full_name: student.full_name,
            email: student.email,
            program_id: student.program_id?.toString() || "", // Use program_id directly
            level: student.level.toString(),
            semester: student.semester,
            active_status: student.active_status,
            del_status: student.del_status,
          });
        } catch (err) {
          setError("Failed to fetch student details. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudent();
  }, [isEditMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const selectedProgram = programs.find(p => p.id === Number(formData.program_id));
      const payload = {
        ...formData,
        program_id: Number(formData.program_id),
        program_name: selectedProgram ? selectedProgram.program_name : "",
        level: Number(formData.level),
      };
      if (isEditMode && id) {
        await updateStudent(id, payload);
      } else {
        await createStudent(payload);
      }
      onSaved();
    } catch (err) {
      setError("Failed to save student. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-slate-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter student ID"
              />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="program_id" className="block text-sm font-medium text-slate-700 mb-1">
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
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.program_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1">
                Level
              </label>
              <input
                type="number"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter level"
              />
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-slate-700 mb-1">
                Semester
              </label>
              <input
                type="text"
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter semester"
              />
            </div>
          </div>

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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Update Student" : "Create Student"}
            </button>
          </div>
        </form>
    </div>
  );
};

export default StudentForm;