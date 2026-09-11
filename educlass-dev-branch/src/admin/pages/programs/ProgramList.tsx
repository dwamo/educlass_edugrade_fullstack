import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getPrograms, deleteProgram } from "../../../services/api"; // API functions
import Modal from "../../../components/Modal";
import ProgramForm from "./ProgramForm";
import ActionsMenu from "../../../components/ActionsMenu";

const ProgramList = () => {
  const navigate = useNavigate();
  interface Program {
    id: number;
    program_name: string;
    description: string;
    duration: string;
  }

  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setSuccessMessage(editingId ? "Program updated successfully!" : "Program created successfully!");
    fetchPrograms();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Fetch programs from the backend
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Failed to fetch programs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle program deletion
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await deleteProgram(id); // API call to delete the program
        setSuccessMessage("Program deleted successfully!"); // Set success message
        fetchPrograms(); // Refresh the program list
        setTimeout(() => setSuccessMessage(""), 3000); // Clear the message after 3 seconds
      } catch (err) {
        console.error("Error deleting program:", err);
        setError("Failed to delete program. Please try again later.");
      }
    }
  };

  // Filter programs based on the search term
  const filteredPrograms = programs.filter((program) =>
    program.program_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Programs</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Program
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
              placeholder="Search programs..."
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

        {/* Programs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Program Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredPrograms.map((program) => (
                <tr key={program.id}>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm font-medium text-slate-900">
                      {program.program_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500">
                      {program.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{program.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <ActionsMenu
                        items={[
                          { label: "View", icon: <FiEye className="h-4 w-4" />, onClick: () => navigate(`/admin/programs/${program.id}`) },
                          { label: "Edit", icon: <FiEdit2 className="h-4 w-4" />, onClick: () => openEditForm(program.id) },
                          { label: "Delete", icon: <FiTrash2 className="h-4 w-4" />, onClick: () => handleDelete(program.id), variant: "danger" },
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
        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Programs Found
            </h3>
            <p className="text-slate-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by creating a new program"}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FiPlus className="mr-2" /> Add Program
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit Program" : "Create Program"}
      >
        <ProgramForm id={editingId ?? undefined} onClose={closeForm} onSaved={handleSaved} />
      </Modal>
    </div>
  );
};

export default ProgramList;