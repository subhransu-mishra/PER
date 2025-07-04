import React, { useState, useEffect } from "react";
import { FiUsers, FiBuilding, FiPlus, FiEye } from "react-icons/fi";
import axios from "axios";

const AdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    email: "",
    password: "",
    employeeId: "",
    tenantId: "",
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3000/api/auth/admin/tenants",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTenants(res.data.data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const fetchTenantUsers = async (tenantId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/api/auth/admin/tenants/${tenantId}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTenantUsers(res.data.data);
      setSelectedTenant(tenants.find((t) => t._id === tenantId));
    } catch (err) {
      console.error("Error fetching tenant users:", err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (
      !createUserForm.email ||
      !createUserForm.password ||
      !createUserForm.employeeId ||
      !createUserForm.tenantId
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/auth/admin/create-user",
        createUserForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("User created successfully!");
      setShowCreateUserModal(false);
      setCreateUserForm({
        email: "",
        password: "",
        employeeId: "",
        tenantId: "",
      });

      // Refresh tenant users if we're viewing that tenant
      if (selectedTenant && selectedTenant._id === createUserForm.tenantId) {
        fetchTenantUsers(createUserForm.tenantId);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      alert(
        "Error creating user: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreateUserForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage tenants and users across the platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tenants Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiBuilding className="w-5 h-5" />
                  Tenants ({tenants.length})
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div
                    key={tenant._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => fetchTenantUsers(tenant._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {tenant.name}
                        </h3>
                        <p className="text-sm text-gray-500">{tenant.email}</p>
                        <p className="text-xs text-gray-400">
                          Created:{" "}
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            tenant.subscriptionStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : tenant.subscriptionStatus === "trial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tenant.subscriptionStatus}
                        </span>
                        <FiEye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Users Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiUsers className="w-5 h-5" />
                  {selectedTenant ? `${selectedTenant.name} Users` : "Users"} (
                  {tenantUsers.length})
                </h2>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-blue-700"
                >
                  <FiPlus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedTenant ? (
                <div className="space-y-4">
                  {tenantUsers.map((user) => (
                    <div
                      key={user._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.email}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {user.employeeId}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                  {tenantUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No users found for this tenant
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a tenant to view users
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
            <div className="bg-white text-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setShowCreateUserModal(false)}
              >
                &times;
              </button>

              <h3 className="text-lg font-semibold mb-4">Create New User</h3>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant *
                  </label>
                  <select
                    name="tenantId"
                    value={createUserForm.tenantId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant._id} value={tenant._id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={createUserForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={createUserForm.employeeId}
                    onChange={handleInputChange}
                    placeholder="Enter employee ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    value={createUserForm.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowCreateUserModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
