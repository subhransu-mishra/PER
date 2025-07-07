import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiCheck,
  FiX,
  FiShield,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  const { user, apiCall, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    permissions: {
      petty_cash: { read: false, write: false, approve: false },
      expenses: { read: false, write: false },
      revenue: { read: false, write: false },
      reports: { read: false, write: false },
    },
  });

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall("GET", "/auth/users");
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (user && hasPermission("users", "read")) {
      fetchUsers();
    }
  }, [user, hasPermission, fetchUsers]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle permission changes
  const handlePermissionChange = (module, action, checked) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: checked,
        },
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiCall("POST", "/auth/create-user", formData);
      if (response.success) {
        await fetchUsers();
        resetForm();
        alert("User created successfully!");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      permissions: {
        petty_cash: { read: false, write: false, approve: false },
        expenses: { read: false, write: false },
        revenue: { read: false, write: false },
        reports: { read: false, write: false },
      },
    });
    setShowModal(false);
  };

  // Handle status toggle
  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      setLoading(true);
      const response = await apiCall("PUT", `/auth/users/${userId}/status`, {
        isActive: currentStatus !== "active",
      });
      if (response.success) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Preset permission templates
  const applyPermissionTemplate = (template) => {
    const templates = {
      viewer: {
        petty_cash: { read: true, write: false, approve: false },
        expenses: { read: true, write: false },
        revenue: { read: true, write: false },
        reports: { read: true, write: false },
      },
      editor: {
        petty_cash: { read: true, write: true, approve: false },
        expenses: { read: true, write: true },
        revenue: { read: true, write: true },
        reports: { read: true, write: false },
      },
      manager: {
        petty_cash: { read: true, write: true, approve: true },
        expenses: { read: true, write: true },
        revenue: { read: true, write: true },
        reports: { read: true, write: true },
      },
    };

    setFormData((prev) => ({
      ...prev,
      permissions: templates[template] || prev.permissions,
    }));
  };

  // Render permission matrix
  const renderPermissionMatrix = () => {
    const modules = ["petty_cash", "expenses", "revenue", "reports"];
    const actions = {
      petty_cash: ["read", "write", "approve"],
      expenses: ["read", "write"],
      revenue: ["read", "write"],
      reports: ["read", "write"],
    };

    return (
      <div className="space-y-4">
        <div className="flex space-x-2 mb-4">
          <button
            type="button"
            onClick={() => applyPermissionTemplate("viewer")}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            Viewer Template
          </button>
          <button
            type="button"
            onClick={() => applyPermissionTemplate("editor")}
            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
          >
            Editor Template
          </button>
          <button
            type="button"
            onClick={() => applyPermissionTemplate("manager")}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm"
          >
            Manager Template
          </button>
        </div>
        {modules.map((module) => (
          <div key={module} className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 capitalize">
              {module.replace("_", " ")}
            </h4>
            <div className="flex space-x-4">
              {actions[module].map((action) => (
                <label key={action} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions[module][action]}
                    onChange={(e) =>
                      handlePermissionChange(module, action, e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {action}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render modal
  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create New User</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength="6"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              {user?.role === "owner" && <option value="admin">Admin</option>}
            </select>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            {renderPermissionMatrix()}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Check permissions
  if (!hasPermission("users", "read")) {
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage organization users and permissions
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Organization Users
            </h3>
            <p className="text-sm text-gray-600">Total users: {users.length}</p>
          </div>
          {hasPermission("users", "write") && (
            <button
              onClick={() => setShowModal(true)}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <FiUserPlus />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiMail className="h-3 w-3 mr-1" />
                            {userItem.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FiShield className="h-3 w-3 mr-1" />
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userItem.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userItem.status === "active" ? (
                          <FiCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <FiX className="h-3 w-3 mr-1" />
                        )}
                        {userItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.permissions ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(userItem.permissions).map(
                            ([module, perms]) =>
                              Object.entries(perms).some(
                                ([, hasPermission]) => hasPermission
                              ) ? (
                                <span
                                  key={module}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {module.replace("_", " ")}
                                </span>
                              ) : null
                          )}
                        </div>
                      ) : (
                        "No permissions"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {hasPermission("users", "write") &&
                          userItem._id !== user._id && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusToggle(
                                    userItem._id,
                                    userItem.status
                                  )
                                }
                                className={`${
                                  userItem.status === "active"
                                    ? "text-red-600 hover:text-red-900"
                                    : "text-green-600 hover:text-green-900"
                                }`}
                                title={
                                  userItem.status === "active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                disabled={loading}
                              >
                                {userItem.status === "active" ? (
                                  <FiX />
                                ) : (
                                  <FiCheck />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  alert("Edit functionality coming soon")
                                }
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                                disabled={loading}
                              >
                                <FiEdit />
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && renderModal()}
    </div>
  );
};

export default UserManagement;
