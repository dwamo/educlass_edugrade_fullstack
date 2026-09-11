import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getLecturers, deleteLecturer } from "../../../services/api"; // Import API functions
import Modal from "../../../components/Modal";
import LecturerForm from "./LecturerForm";
import ActionsMenu from "../../../components/ActionsMenu";

const LecturerList = () => {
  const [lecturers, setLecturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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
    setSuccessMessage(editingId ? "Lecturer updated successfully!" : "Lecturer created successfully!");
    fetchLecturers();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Fetch lecturers from the backend
  const fetchLecturers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLecturers(); // Fetch lecturers from the backend
      setLecturers(data);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
      setError("Failed to fetch lecturers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete lecturer
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this lecturer?")) {
      try {
        await deleteLecturer(id); // Delete lecturer from the backend
        fetchLecturers(); // Refresh the list after deletion
      } catch (err) {
        console.error("Error deleting lecturer:", err);
        setError("Failed to delete lecturer. Please try again later.");
      }
    }
  };

  // Filter lecturers based on the search term
  const filteredLecturers = lecturers.filter(
    (lecturer: any) =>
      lecturer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lecturer.lecturer_id || "").toLowerCase().includes(searchTerm.toLowerCase()) // Include lecturer_id in the search
  );

  // Fetch lecturers on component mount
  useEffect(() => {
    fetchLecturers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Lecturers</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Lecturer
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
              placeholder="Search lecturers..."
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

        {/* Lecturers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Staff ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Lecturer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLecturers.map((lecturer: any) => (
                <tr key={lecturer.staff_id}>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm font-medium text-slate-900">
                      {lecturer.staff_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-900">{lecturer.lecturer_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-900">{lecturer.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{lecturer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{lecturer.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <ActionsMenu
                        items={[
                          { label: "Edit", icon: <FiEdit2 className="h-4 w-4" />, onClick: () => openEditForm(lecturer.staff_id) },
                          { label: "Delete", icon: <FiTrash2 className="h-4 w-4" />, onClick: () => handleDelete(lecturer.staff_id), variant: "danger" },
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
        {filteredLecturers.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Lecturers Found
            </h3>
            <p className="text-slate-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by adding a new lecturer"}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FiPlus className="mr-2" /> Add Lecturer
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit Lecturer" : "Create Lecturer"}
      >
        <LecturerForm id={editingId ?? undefined} onClose={closeForm} onSaved={handleSaved} />
      </Modal>
    </div>
  );
};

export default LecturerList;