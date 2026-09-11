import React, { useState, useEffect, useRef } from "react";
import { FiCamera } from "react-icons/fi";
import { getUserById, createUser, updateUser, getLecturers, getStudents, uploadUserAvatar, resolveAssetUrl } from "../../../services/api";
import { Avatar } from "../../../components/UserMenu";

interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  lecturer_id?: string;
  student_id?: string;
}

interface Lecturer {
  staff_id: number;
  full_name: string;
}

interface Student {
  id: string;
  full_name: string;
}

interface UserFormProps {
  id?: number;
  onClose: () => void;
  onSaved: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ id, onClose, onSaved }) => {
  const isEditMode = id != null;

  const [formData, setFormData] = useState<Omit<User, "id">>({
    username: "",
    email: "",
    password: "",
    role: "",
    lecturer_id: undefined,
    student_id: undefined,
  });

  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      fetchUserById(id).finally(() => setIsLoading(false));
    }
    fetchLecturers();
    fetchStudents(); // <-- Fetch students on mount
  }, [isEditMode, id]);

  const fetchUserById = async (userId: number) => {
    try {
      const user = await getUserById(userId);
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
        lecturer_id: user.lecturer_id != null ? String(user.lecturer_id) : undefined,
        student_id: user.student_id != null ? String(user.student_id) : undefined,
      });
      setAvatarUrl(resolveAssetUrl(user.profile_image));
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Failed to fetch user details.");
      onClose();
    }
  };

  const fetchLecturers = async () => {
    try {
      const data = await getLecturers();
      setLecturers(
        data.map((lec: any) => ({
          staff_id: lec.staff_id ?? lec.id,
          full_name: lec.full_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  // Fetch students from the backend
  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(
        data.map((stu: any) => ({
          id: stu.id?.toString(),
          full_name: stu.full_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "role") {
        return {
          ...prev,
          [name]: value,
          lecturer_id: value === "lecturer" ? "" : undefined,
          student_id: value === "student" ? "" : undefined,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2MB.");
      return;
    }
    setAvatarError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert lecturer_id and student_id to numbers if present and not empty
    const submitData = {
      ...formData,
      lecturer_id:
        formData.role === "lecturer" && formData.lecturer_id
          ? Number(formData.lecturer_id)
          : undefined,
      student_id:
        formData.role === "student" && formData.student_id
          ? Number(formData.student_id)
          : undefined,
    };

    try {
      if (isEditMode && id) {
        await updateUser(id, submitData as any);
        if (avatarFile) {
          await uploadUserAvatar(id, avatarFile);
        }
      } else {
        const newUser = await createUser(submitData as any);
        if (avatarFile) {
          await uploadUserAvatar(newUser.user_id, avatarFile);
        }
      }
      onSaved();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-20 h-20 rounded-full"
              aria-label={isEditMode ? "Change profile photo" : "Add profile photo"}
            >
              <Avatar imageUrl={avatarPreview ?? avatarUrl} username={formData.username} size="md" />
              <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                <FiCamera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              {isEditMode ? "Change photo" : "Add image"}
            </button>
            {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {isEditMode ? "New Password (optional)" : "Password"}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder={
                  isEditMode
                    ? "Enter new password (leave blank to keep current password)"
                    : "Enter password"
                }
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="lecturer">Lecturer</option>
                <option value="student">Student</option>
              </select>
            </div>

            {formData.role === "lecturer" && (
              <div>
                <label
                  htmlFor="lecturer_id"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Select Lecturer
                </label>
                <select
                  id="lecturer_id"
                  name="lecturer_id"
                  value={formData.lecturer_id || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.staff_id} value={lecturer.staff_id}>
                      {lecturer.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.role === "student" && (
              <div>
                <label
                  htmlFor="student_id"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Select Student
                </label>
                <select
                  id="student_id"
                  name="student_id"
                  value={formData.student_id || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
            >
              {isEditMode ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
    </div>
  );
};

export default UserForm;