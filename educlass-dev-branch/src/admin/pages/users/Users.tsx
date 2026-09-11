import { useEffect, useState } from "react";
import { FiTrash2, FiEdit, FiPlus } from "react-icons/fi"; // Import icons
import { getUsers, deleteUser, resolveAssetUrl } from "../../../services/api";
import Modal from "../../../components/Modal";
import UserForm from "./UserForm";
import { Avatar } from "../../../components/UserMenu";
import ActionsMenu from "../../../components/ActionsMenu";

const Users = () => {
  interface User {
    id: number;
    user_id: number;
    username: string;
    email: string;
    role: string;
    profile_image?: string | null;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
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
    setSuccessMessage(editingId ? "User updated successfully!" : "User created successfully!");
    fetchUsers();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      const formattedData: User[] = data.map((user: any) => ({
        id: user.user_id,
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
      }));
      setUsers(formattedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeleteUser = async (user_id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(user_id);
        setSuccessMessage("User deleted successfully!"); // Set success message
        fetchUsers(); // Refresh the user list
        setTimeout(() => setSuccessMessage(""), 3000); // Clear the message after 3 seconds
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add User
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
              placeholder="Search users..."
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

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-wrap">
                    <Avatar imageUrl={resolveAssetUrl(user.profile_image)} username={user.username} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm font-medium text-slate-900">
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="text-sm text-slate-500">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-wrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <ActionsMenu
                        items={[
                          { label: "Edit", icon: <FiEdit className="h-4 w-4" />, onClick: () => openEditForm(user.user_id) },
                          { label: "Delete", icon: <FiTrash2 className="h-4 w-4" />, onClick: () => handleDeleteUser(user.user_id), variant: "danger" },
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
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Users Found
            </h3>
            <p className="text-slate-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by adding a new user"}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FiPlus className="mr-2" /> Add User
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit User" : "Create User"}
      >
        <UserForm id={editingId ?? undefined} onClose={closeForm} onSaved={handleSaved} />
      </Modal>
    </div>
  );
};

export default Users;