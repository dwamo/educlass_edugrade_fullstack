import React, { useState, useEffect } from "react";
import { getProgramById, createProgram, updateProgram } from "../../../services/api"; // API functions

interface ProgramFormProps {
  id?: number;
  onClose: () => void;
  onSaved: () => void;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ id, onClose, onSaved }) => {
  const isEditMode = id != null;

  const [formData, setFormData] = useState({
    program_name: "",
    description: "",
    duration: "4 years",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch program data if in edit mode
  useEffect(() => {
    const fetchProgram = async () => {
      if (isEditMode && id) {
        setLoading(true);
        setError("");
        try {
          const program = await getProgramById(id);
          setFormData({
            program_name: program.program_name,
            description: program.description,
            duration: program.duration,
          });
        } catch (err) {
          console.error("Error fetching program:", err);
          setError("Failed to load program data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgram();
  }, [isEditMode, id]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
        await updateProgram(id, formData);
      } else {
        await createProgram(formData);
      }
      onSaved();
    } catch (err) {
      console.error("Error saving program:", err);
      setError("Failed to save program. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Program Name */}
          <div>
            <label
              htmlFor="program_name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Program Name
            </label>
            <input
              type="text"
              id="program_name"
              name="program_name"
              value={formData.program_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Enter program name"
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
              placeholder="Enter program description"
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
              readOnly
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-500"
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
            {loading ? "Saving..." : isEditMode ? "Update Program" : "Create Program"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgramForm;
