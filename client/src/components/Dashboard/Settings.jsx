import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiDownload,
  FiSettings,
  FiUser,
  FiLock,
  FiMail,
  FiLayout,
  FiPrinter,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { user, apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");
  const [loading, setLoading] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
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

      // Make API call to download the report
      const response = await axios({
        url: `http://localhost:3000/api/${reportType}/report`,
        method: "POST",
        data: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
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

  // Add this function for Petty Cash export (copy from PettyCash.jsx)
  const handleExportPettyCashPDF = async (startDate, endDate) => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("from", startDate);
      if (endDate) queryParams.append("to", endDate);
      const response = await axios.get(
        `http://localhost:3000/api/export/pettycash?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Generate filename with date range
      const fromDate = startDate
        ? new Date(startDate).toLocaleDateString("en-GB")
        : "all";
      const toDate = endDate
        ? new Date(endDate).toLocaleDateString("en-GB")
        : "all";
      link.setAttribute(
        "download",
        `petty-cash-report-${fromDate}-to-${toDate}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err.response?.data?.message || "Failed to export PDF");
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    // Implementation for profile update
    toast.success("Profile updated successfully");
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    toast.success("Password updated successfully");
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
              <button
                onClick={() => setActiveTab("preferences")}
                className={`py-4 px-6 cursor-pointer text-center border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "preferences"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiLayout className="mr-2" /> Preferences
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
                        onClick={() =>
                          handleExportPettyCashPDF(
                            dateRange.startDate,
                            dateRange.endDate
                          )
                        }
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

                  {/* Print Options */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Additional Reports
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex cursor-pointer items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <FiPrinter className="mr-2" /> Print Summary Report
                      </button>
                      <button className="flex items-center justify-center cursor-pointer px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <FiFileText className="mr-2" /> Generate Annual Report
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
                  Profile Settings
                </h2>
                <p className="text-gray-600 mb-6">
                  Update your profile information
                </p>

                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.jobTitle || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={user?.bio || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Security Settings
                </h2>
                <p className="text-gray-600 mb-6">
                  Update your password and security preferences
                </p>

                <form onSubmit={updatePassword} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Update Password
                    </button>
                  </div>
                </form>

                <div className="mt-10 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add an additional layer of security to your account
                  </p>
                  <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Enable Two-Factor Authentication
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  App Preferences
                </h2>
                <p className="text-gray-600 mb-6">
                  Customize your application experience
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email-notifications"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="email-notifications"
                            className="font-medium text-gray-700"
                          >
                            Email Notifications
                          </label>
                          <p className="text-gray-500">
                            Receive email notifications for important updates
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="app-notifications"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="app-notifications"
                            className="font-medium text-gray-700"
                          >
                            In-App Notifications
                          </label>
                          <p className="text-gray-500">
                            Receive notifications within the application
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      Appearance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <div className="h-12 bg-white border border-gray-300 rounded mb-2"></div>
                        <div className="text-center text-sm font-medium">
                          Light Mode
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <div className="h-12 bg-gray-900 border border-gray-700 rounded mb-2"></div>
                        <div className="text-center text-sm font-medium">
                          Dark Mode
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-900 border border-gray-300 rounded mb-2"></div>
                        <div className="text-center text-sm font-medium">
                          System Default
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      Default Currency
                    </h3>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      defaultValue="INR"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Preferences
                    </button>
                  </div>
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
