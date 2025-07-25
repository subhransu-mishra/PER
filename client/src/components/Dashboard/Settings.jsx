import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  FiDownload,
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account and download reports
          </p>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-4 cursor-pointer px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiFileText className="mr-2" /> Reports
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 cursor-pointer text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiUser className="mr-2" /> Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-6 cursor-pointer text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "security"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiLock className="mr-2" /> Security
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Download Reports
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Generate and download financial reports for your records or
                    analysis
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                    <FiAlertCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Select a date range to generate reports. Reports will
                      include all transactions between the selected dates.
                    </p>
                  </div>

                  {/* Date Range Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Report Types */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Revenue Report */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FiDownload className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          PDF
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Revenue Report
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a detailed report of all revenue transactions
                      </p>
                      <button
                        onClick={() => downloadReport("revenue")}
                        disabled={downloadingReport === "revenue"}
                        className="w-full flex justify-center cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                      >
                        {downloadingReport === "revenue" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-100 rounded-full">
                          <FiDownload className="h-6 w-6 text-red-600" />
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          PDF
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Expense Report
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a detailed report of all expense transactions
                      </p>
                      <button
                        onClick={() => downloadReport("expense")}
                        disabled={downloadingReport === "expense"}
                        className="w-full flex justify-center cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                      >
                        {downloadingReport === "expense" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <FiDownload className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          PDF
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Petty Cash Report
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a detailed report of all petty cash
                        transactions
                      </p>
                      <button
                        onClick={() => downloadReport("pettycash")}
                        disabled={downloadingReport === "pettycash"}
                        className="w-full flex justify-center cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
                      >
                        {downloadingReport === "pettycash" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Information
                </h2>
                <p className="text-gray-600 mb-6">
                  Your personal and account information
                </p>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user?.name || "User Name"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Change Password
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  For your security, we recommend choosing a strong password
                  that you don't use elsewhere.
                </p>

                <div className="border border-gray-200 rounded-lg p-6">
                  <form onSubmit={updatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
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
                        className="px-4 py-2 border cursor-pointer border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
