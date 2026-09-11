import React, { useState, useEffect } from "react";
import { getLecturerById, createLecturer, updateLecturer } from "../../../services/api"; // Import API functions

interface LecturerFormProps {
  id?: number;
  onClose: () => void;
  onSaved: () => void;
}

const LecturerForm: React.FC<LecturerFormProps> = ({ id, onClose, onSaved }) => {
  const isEditMode = id != null;

  const [formData, setFormData] = useState({
    lecturer_id: "", // Add lecturer_id to the form state
    full_name: "",
    email: "",
    department: "",
    phone_number: "",
    address: "",
    active_status: true, // Default value
    del_status: false,   // Default value
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch lecturer data if in edit mode
  useEffect(() => {
    const fetchLecturer = async () => {
      if (isEditMode && id) {
        setLoading(true);
        setError("");
        try {
          const lecturer = await getLecturerById(id); // Fetch lecturer by ID
          setFormData({
            lecturer_id: lecturer.lecturer_id, // Populate lecturer_id
            full_name: lecturer.full_name,
            email: lecturer.email,
            department: lecturer.department,
            phone_number: lecturer.phone_number,
            address: lecturer.address,
            active_status: lecturer.active_status,
            del_status: lecturer.del_status,
          });
        } catch (err) {
          console.error("Error fetching lecturer:", err);
          setError("Failed to fetch lecturer details. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLecturer();
  }, [isEditMode, id]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditMode && id) {
        // Update lecturer
        await updateLecturer(id, formData);
      } else {
        // Create lecturer
        await createLecturer(formData);
      }
      onSaved();
    } catch (err) {
      console.error("Error saving lecturer:", err);
      setError("Failed to save lecturer. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Lecturer ID */}
            <div>
              <label
                htmlFor="lecturer_id"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Lecturer ID
              </label>
              <input
                type="text"
                id="lecturer_id"
                name="lecturer_id"
                value={formData.lecturer_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter lecturer ID"
              />
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
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

            {/* Email */}
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

            {/* Department */}
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter department"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter phone number"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter address"
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Update Lecturer" : "Create Lecturer"}
            </button>
          </div>
        </form>
    </div>
  );
};

export default LecturerForm;