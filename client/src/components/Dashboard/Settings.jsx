import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiDownload,
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiAlertCircle,
  FiUsers,
  FiTrash2,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Settings = () => {
  const { user, organization } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");
  const [downloadingReport, setDownloadingReport] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  // Add state for password reset
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null,
  });

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const downloadReport = async (reportType) => {
    try {
      setDownloadingReport(reportType);
      const token = localStorage.getItem("token");

      if (!dateRange.startDate || !dateRange.endDate) {
        toast.error("Please select start and end dates for the report");
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append("from", dateRange.startDate);
      queryParams.append("to", dateRange.endDate);

      // Make API call to download the report
      const response = await axios({
        url: `http://localhost:3000/api/export/${reportType}?${queryParams}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } report downloaded successfully`
      );
    } catch (error) {
      console.error(`Error downloading ${reportType} report:`, error);
      toast.error(
        `Failed to download report: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setDownloadingReport("");
    }
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Update password function
  const updatePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:3000/api/reset/reset-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear form fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success(response.data.message || "Password updated successfully");
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update fetchUsers function
  const fetchUsers = async () => {
    if (user?.role !== "admin") return; // Fix the condition

    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token");

      // Make sure to use the API_BASE_URL
      const response = await axios.get(
        `${API_BASE_URL}/api/users/organization-users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Update handleDeleteUser to show confirmation first
  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find((u) => u._id === userId);
    setDeleteModal({
      isOpen: true,
      user: userToDelete,
    });
  };

  // New function to handle actual deletion
  const confirmDelete = async () => {
    if (!deleteModal.user) return;

    try {
      setDeletingUser(deleteModal.user._id);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_BASE_URL}/api/users/delete/${deleteModal.user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setUsers(users.filter((u) => u._id !== deleteModal.user._id));
        toast.success("User deleted successfully");
        setDeleteModal({ isOpen: false, user: null });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  // Add useEffect to fetch users when tab changes
  useEffect(() => {
    if (activeTab === "users" && user?.role === "admin") {
      fetchUsers();
    }
  }, [activeTab]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage your account and download reports
          </p>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile tab selector (dropdown for small screens) */}
          <div className="block sm:hidden p-4 border-b border-gray-200">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="reports">Reports</option>
              <option value="profile">Profile</option>
              <option value="security">Security</option>
              {user?.role === "admin" && <option value="users">Users</option>}
            </select>
          </div>

          {/* Tabs for medium screens and up */}
          <div className="hidden sm:block border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center ${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiFileText className="mr-1 sm:mr-2 flex-shrink-0" />{" "}
                <span>Reports</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiUser className="mr-1 sm:mr-2 flex-shrink-0" />{" "}
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center ${
                  activeTab === "security"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiLock className="mr-1 sm:mr-2 flex-shrink-0" />{" "}
                <span>Security</span>
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center ${
                    activeTab === "users"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FiUsers className="mr-1 sm:mr-2 flex-shrink-0" />{" "}
                  <span>Users</span>
                </button>
              )}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
                    Download Reports
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Generate and download financial reports for your records or
                    analysis
                  </p>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 flex items-start">
                    <FiAlertCircle className="text-blue-500 mt-1 mr-2 sm:mr-3 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                    <p className="text-xs sm:text-sm text-blue-700">
                      Select a date range to generate reports. Reports will
                      include all transactions between the selected dates.
                    </p>
                  </div>

                  {/* Date Range Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Report Types */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Revenue Report */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-full">
                          <FiDownload className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          PDF
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                        Revenue Report
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Download a detailed report of all revenue transactions
                      </p>
                      <button
                        onClick={() => downloadReport("revenue")}
                        disabled={downloadingReport === "revenue"}
                        className="w-full flex justify-center cursor-pointer items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                      >
                        {downloadingReport === "revenue" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Downloading...
                          </>
                        ) : (
                          <>Download Revenue Report</>
                        )}
                      </button>
                    </div>

                    {/* Expense Report */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 bg-red-100 rounded-full">
                          <FiDownload className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          PDF
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                        Expense Report
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Download a detailed report of all expense transactions
                      </p>
                      <button
                        onClick={() => downloadReport("expense")}
                        disabled={downloadingReport === "expense"}
                        className="w-full flex justify-center cursor-pointer items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                      >
                        {downloadingReport === "expense" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Downloading...
                          </>
                        ) : (
                          <>Download Expense Report</>
                        )}
                      </button>
                    </div>

                    {/* Petty Cash Report */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-full">
                          <FiDownload className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          PDF
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                        Petty Cash Report
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Download a detailed report of all petty cash
                        transactions
                      </p>
                      <button
                        onClick={() => downloadReport("pettycash")}
                        disabled={downloadingReport === "pettycash"}
                        className="w-full flex justify-center cursor-pointer items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
                      >
                        {downloadingReport === "pettycash" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Downloading...
                          </>
                        ) : (
                          <>Download Petty Cash Report</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
                  Profile Information
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  Your personal and account information
                </p>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg sm:text-xl mr-3 sm:mr-4">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {user?.name || "User Name"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Account Information
                        </h4>
                        <div className="space-y-3 mt-2">
                          <div>
                            <span className="text-sm text-gray-500">
                              Email:
                            </span>
                            <p className="font-medium text-gray-900">
                              {user?.email || "Not available"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Role:</span>
                            <p className="font-medium text-gray-900 capitalize">
                              {user?.role === "admin" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Administrator
                                </span>
                              ) : user?.role === "accountant" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Accountant
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {user?.role || "User"}
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Account Status:
                            </span>
                            <p className="font-medium text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Organization Details
                        </h4>
                        <div className="space-y-3 mt-2">
                          <div>
                            <span className="text-sm text-gray-500">
                              Company Name:
                            </span>
                            <p className="font-medium text-gray-900">
                              {organization?.name || "Not available"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Company Owner:
                            </span>
                            <p className="font-medium text-gray-900">
                              {user?.isCompanyOwner ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Yes
                                </span>
                              ) : (
                                "No"
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Joined On:
                            </span>
                            <p className="font-medium text-gray-900">
                              {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )
                                : "Not available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4"></div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                  Change Password
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  For your security, we recommend choosing a strong password
                  that you don't use elsewhere.
                </p>

                <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                  <form
                    onSubmit={updatePassword}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      {/* Current Password */}
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute cursor-pointer inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? (
                              <FiEyeOff className="h-5 w-5" />
                            ) : (
                              <FiEye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                            placeholder="Enter new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute cursor-pointer inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? (
                              <FiEyeOff className="h-5 w-5" />
                            ) : (
                              <FiEye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                            placeholder="Confirm new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute cursor-pointer inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <FiEyeOff className="h-5 w-5" />
                            ) : (
                              <FiEye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 border cursor-pointer border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Users Tab - Admin Only */}
            {activeTab === "users" && user?.role === "admin" && (
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">
                  Organization Users
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  Manage users in your organization
                </p>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Desktop table view - hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loadingUsers ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              Loading users...
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 font-medium text-lg">
                                        {u.name?.charAt(0).toUpperCase() || "U"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {u.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Joined{" "}
                                      {new Date(
                                        u.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {u.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    u.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {u._id !== user?.id && u.role !== "admin" && (
                                  <button
                                    onClick={() => handleDeleteUser(u._id)}
                                    disabled={deletingUser === u._id}
                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                  >
                                    {deletingUser === u._id ? (
                                      <span className="flex items-center">
                                        <svg
                                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                        Deleting...
                                      </span>
                                    ) : (
                                      <FiTrash2 className="w-5 h-5" />
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card view for users */}
                  <div className="md:hidden">
                    {loadingUsers ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        Loading users...
                      </div>
                    ) : users.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No users found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {users.map((u) => (
                          <div key={u._id} className="p-4">
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-lg">
                                  {u.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {u.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {u.email}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    u.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {u.role}
                                </span>
                                <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </div>

                              {u._id !== user?.id && u.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  disabled={deletingUser === u._id}
                                  className="text-red-600 hover:text-red-900 cursor-pointer p-2"
                                >
                                  {deletingUser === u._id ? (
                                    <span className="flex items-center">
                                      <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Deleting...
                                    </span>
                                  ) : (
                                    <FiTrash2 className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - make responsive */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            {/* Modal panel */}
            <div className="relative inline-block w-full max-w-md p-4 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FiTrash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900 mb-2">
                    Delete User Account
                  </h3>
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Are you sure you want to delete the account for{" "}
                      <span className="font-semibold text-gray-900">
                        {deleteModal.user?.name}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1 sm:mb-2">
                      User details:
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-medium">Email:</span>{" "}
                        {deleteModal.user?.email}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-medium">Role:</span>{" "}
                        {deleteModal.user?.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, user: null })}
                  className="inline-flex cursor-pointer justify-center px-3 sm:px-4 py-1.5 sm:py-2 mt-3 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 sm:mt-0"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={!!deletingUser}
                  className="inline-flex cursor-pointer justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingUser ? (
                    <>
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 -ml-1 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
