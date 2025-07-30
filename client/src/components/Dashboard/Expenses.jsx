import React, { useState, useEffect, useCallback } from "react";
import {
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiDownload,
  FiEdit2, // Add edit icon
} from "react-icons/fi";
import { FiEdit } from "react-icons/fi";

import { MdAccountBalanceWallet } from "react-icons/md";
import { IoAnalyticsSharp } from "react-icons/io5";
import { TbMoneybag } from "react-icons/tb";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
// console.log("API Base URL:", API_BASE_URL); // Debug to check if it's correct

const emptyExpense = {
  serialNumber: "",
  date: format(new Date(), "yyyy-MM-dd"),
  description: "",
  category: "",
  amount: "", // We'll handle this as a string in the UI and convert when needed
  paymentType: "cash",
  billFile: null,
};

const initialCategories = [
  "rent",
  "travel",
  "electricity",
  "appliances",
  "utils",
  "others",
];

const Expenses = () => {
  const { user, apiCall } = useAuth();

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null, // 'approve' | 'reject'
    expenseId: null,
  });

  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyExpense);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serialNumberLoading, setSerialNumberLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem("expenseCategories");
    return savedCategories ? JSON.parse(savedCategories) : initialCategories;
  });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [serialFilter, setSerialFilter] = useState("");
  const [stats, setStats] = useState({
    currentMonthTotal: 0,
    prevMonthTotal: 0,
    percentageChange: 0,
    pendingCount: 0,
    month: "",
    year: "",
  });
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  // Add edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState(emptyExpense);
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Add view details modal state
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("expenseCategories", JSON.stringify(categories));
  }, [categories]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, billFile: files[0] }));
    } else if (name === "amount") {
      // Ensure amount is always stored as a valid number string (prevent empty or NaN)
      const numericValue = value === "" ? "" : parseFloat(value);
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === "category" && value === "__add_new__") {
      setShowNewCategoryInput(true);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setEditForm((prev) => ({ ...prev, billFile: files[0] }));
    } else if (name === "amount") {
      const numericValue = value === "" ? "" : parseFloat(value);
      setEditForm((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === "category" && value === "__add_new__") {
      setShowNewCategoryInput(true);
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall("GET", "/expense");

      if (data.success) {
        setExpenses(data.data);
      } else {
        console.error("Failed to fetch expenses:", data.message);
        setExpenses([]);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiCall("GET", "/expense/stats");

      if (data.success && data.data) {
        console.log("Stats received from API:", data.data);
        setStats((prevStats) => ({
          ...prevStats,
          // Default values for any missing fields
          currentMonthTotal: data.data.currentMonthTotal || 0,
          prevMonthTotal: data.data.prevMonthTotal || 0,
          percentageChange: data.data.percentageChange || 0,
          pendingCount: data.data.pendingCount || 0,
          month:
            data.data.month ||
            new Date().toLocaleString("default", { month: "long" }),
          year: data.data.year || new Date().getFullYear(),
        }));
        console.log("Stats after update:", {
          currentMonthTotal: data.data.currentMonthTotal,
          updatedState: data.data.currentMonthTotal || 0,
        });
      } else {
        console.error("Failed to fetch expense stats:", data.message);
        toast.error("Failed to fetch expense statistics");
      }
    } catch (err) {
      console.error("Error fetching expense stats:", err);
      toast.error("Error loading expense statistics");
    }
  }, [apiCall]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchExpenses(), fetchStats()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, fetchStats]);

  // User's company data is automatically filtered by the backend based on their organization ID

  // Filter expenses based on search, date, and serial number
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.category.toLowerCase().includes(search.toLowerCase()) ||
      (expense.status &&
        expense.status.toLowerCase().includes(search.toLowerCase()));
    const matchesSerial = serialFilter
      ? (expense.serialNumber || "")
          .toLowerCase()
          .includes(serialFilter.toLowerCase())
      : true;
    const matchesFromDate = fromDate
      ? new Date(expense.date) >= new Date(fromDate)
      : true;
    const matchesToDate = toDate
      ? new Date(expense.date) <= new Date(toDate)
      : true;
    return matchesSearch && matchesSerial && matchesFromDate && matchesToDate;
  });

  // Add this after filteredExpenses definition
  const displayedExpenses = showAllExpenses
    ? filteredExpenses
    : filteredExpenses.slice(0, 10);

  // Fetch next expense serial number
  const fetchNextSerialNumber = async () => {
    try {
      setSerialNumberLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/expense/next-serial`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setForm((prev) => ({
          ...prev,
          serialNumber: res.data.nextSerialNumber,
        }));
      } else {
        console.error("Failed to fetch next serial number:", res.data.message);
        toast.error("Failed to generate serial number");
      }
    } catch (err) {
      console.error("Error fetching next serial number:", err);
      toast.error("Failed to generate serial number");
    } finally {
      setSerialNumberLoading(false);
    }
  };

  // Approve expense after confirmation
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/api/expense/${id}/status`,
        { status: "approved" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update the expense in the local state
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === id ? { ...exp, status: "approved" } : exp
          )
        );

        // Refresh statistics
        await fetchStats();

        // Show success toast
        toast.success("Expense approved successfully", {
          duration: 3000,
          position: "top-right",
        });
      } else {
        toast.error(response.data.message || "Failed to approve expense", {
          duration: 3000,
          position: "top-right",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve expense", {
        duration: 3000,
        position: "top-right",
      });
      console.error("Error approving expense:", err);
    }
  };

  // Reject expense after confirmation
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/api/expense/${id}/status`,
        { status: "rejected" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update the expense in the local state
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === id ? { ...exp, status: "rejected" } : exp
          )
        );

        // Refresh statistics
        await fetchStats();

        // Show success toast
        toast.success("Expense rejected successfully", {
          duration: 3000,
          position: "top-right",
        });
      } else {
        toast.error(response.data.message || "Failed to reject expense", {
          duration: 3000,
          position: "top-right",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject expense", {
        duration: 3000,
        position: "top-right",
      });
      console.error("Error rejecting expense:", err);
    }
  };

  // Handle new expense submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started"); // Debug log

    if (
      !form.date ||
      !form.category ||
      !form.description ||
      !form.amount ||
      !form.paymentType
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setFormLoading(true);
      console.log("Setting form loading state"); // Debug log

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        setFormLoading(false);
        return;
      }

      const formData = new FormData();

      // Append all form fields to FormData
      formData.append("date", form.date);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("amount", form.amount.toString()); // Ensure it's a string for FormData
      formData.append("paymentType", form.paymentType);

      // Debug log what's being sent
      console.log("Sending expense data:", {
        date: form.date,
        category: form.category,
        description: form.description,
        amount: form.amount,
        paymentType: form.paymentType,
      });

      // Append bill file if exists
      if (form.billFile) {
        formData.append("bill", form.billFile);
      }

      console.log(
        "About to make API request to:",
        `${API_BASE_URL}/api/expense/create`
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/expense/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API response received:", response.data);

      if (response.data && response.data.success) {
        toast.success("Expense submitted successfully");

        // Log the received expense data for debugging
        console.log("Created expense:", response.data.expense);

        // Add the new expense to the state
        setExpenses((prev) => [response.data.expense, ...prev]);

        // Reset form and close modal
        setForm(emptyExpense);
        setShowModal(false);

        // Refresh stats
        fetchStats();
      } else {
        console.error("API returned success: false", response.data);
        toast.error(response.data?.message || "Failed to submit expense");
      }
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);

      // More detailed error handling
      if (err.response) {
        // Server responded with error
        console.error("Server error:", err.response.data);
        toast.error(
          err.response.data?.message || "Server error: " + err.response.status
        );
      } else if (err.request) {
        // Request made but no response received
        console.error("Network error - no response");
        toast.error("Network error. Please check your connection.");
      } else {
        // Something else caused the error
        console.error("Error:", err.message);
        toast.error("Error: " + err.message);
      }
    } finally {
      console.log("Setting formLoading to false"); // Debug log
      setFormLoading(false);
    }
  };

  const handleNewExpense = async () => {
    // Reset form to default values
    setForm({
      ...emptyExpense,
      date: format(new Date(), "yyyy-MM-dd"),
    });

    // Clear any previous form errors
    setFormLoading(false);

    // Show modal
    setShowModal(true);

    try {
      // Fetch next serial number
      await fetchNextSerialNumber();
    } catch (error) {
      console.error("Error fetching serial number:", error);
      toast.error("Could not generate serial number, but you can continue");
    }
  };

  // Handle edit expense
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      serialNumber: expense.serialNumber,
      date: format(new Date(expense.date), "yyyy-MM-dd"),
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      paymentType: expense.paymentType,
      billFile: null, // Reset file input
      billUrl: expense.billUrl, // Keep existing bill URL
    });
    setEditModal(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (
      !editForm.date ||
      !editForm.category ||
      !editForm.description ||
      !editForm.amount ||
      !editForm.paymentType
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setEditFormLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("date", editForm.date);
      formData.append("category", editForm.category);
      formData.append("description", editForm.description);
      formData.append("amount", editForm.amount.toString());
      formData.append("paymentType", editForm.paymentType);

      // Only append bill file if a new one is selected
      if (editForm.billFile) {
        formData.append("bill", editForm.billFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/expense/${editingExpense._id}/edit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.success) {
        toast.success("Expense updated successfully");

        // Update the expense in the state
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === editingExpense._id ? response.data.expense : exp
          )
        );

        // Reset and close modal
        setEditForm(emptyExpense);
        setEditModal(false);
        setEditingExpense(null);

        // Refresh stats
        fetchStats();
      } else {
        toast.error(response.data?.message || "Failed to update expense");
      }
    } catch (err) {
      console.error("Edit expense error:", err);
      if (err.response) {
        toast.error(
          err.response.data?.message || "Server error: " + err.response.status
        );
      } else if (err.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Error: " + err.message);
      }
    } finally {
      setEditFormLoading(false);
    }
  };

  // Handle view expense details
  const handleViewDetails = (expense) => {
    setViewingExpense(expense);
    setViewDetailsModal(true);
  };

  const closeViewDetailsModal = () => {
    setViewDetailsModal(false);
    setViewingExpense(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyExpense);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setEditForm(emptyExpense);
    setEditingExpense(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Total Expenses Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Expenses This Month
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  ₹{(stats.currentMonthTotal || 0).toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500">
                  {stats.month} {stats.year}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <MdAccountBalanceWallet className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Change from Last Month Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Change from Last Month
                </p>
                <h3
                  className={`text-xl font-bold ${
                    stats.percentageChange < 0
                      ? "text-green-600"
                      : "text-red-600"
                  } mb-1`}
                >
                  {Math.abs(stats.percentageChange).toFixed(2)}%{" "}
                  {stats.percentageChange < 0 ? "less" : "more"}
                </h3>
                <p className="text-xs text-gray-500">
                  Previous: ₹{(stats.prevMonthTotal || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <IoAnalyticsSharp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Pending Expenses Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Pending Expenses
                </p>
                <h3 className="text-xl font-bold text-amber-500 mb-1">
                  {stats.pendingCount} expense
                  {stats.pendingCount !== 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <TbMoneybag className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue- mb-2 text-black">
            Expense Management
          </h1>
          <p className="text-gray-600">
            Track and manage your company expenses
          </p>
        </div>
        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            {/* Date and Serial Filters */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="From date"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="To date"
              />
              <input
                type="text"
                value={serialFilter}
                onChange={(e) => setSerialFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Serial Number"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleNewExpense}
                className="inline-flex cursor-pointer items-center justify-center px-4 py-3 sm:px-3 sm:py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 min-h-[44px] touch-manipulation"
              >
                <FiPlus className="mr-2 h-4 w-4" /> New Expense
              </button>
            </div>
          </div>
        </div>
        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt
                    </th>
                    {/* Only show Details column for admin */}
                    {user?.role === "admin" && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={user?.role === "admin" ? "10" : "9"}
                        className="px-6 py-8 text-center"
                      >
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-3 text-blue-500"
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
                          Loading expenses...
                        </div>
                      </td>
                    </tr>
                  ) : displayedExpenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={user?.role === "admin" ? "10" : "9"}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    displayedExpenses.map((expense) => {
                      // Check if current user can edit this expense
                      const canEdit =
                        expense.status === "pending" &&
                        (user?.role === "admin" ||
                          expense.createdBy?._id === user?._id ||
                          expense.createdBy?.toString() === user?.id ||
                          expense.createdBy === user?.id);

                      // Check if current user can approve/reject (admin only)
                      const canApproveReject =
                        user?.role === "admin" && expense.status === "pending";

                      return (
                        <tr
                          key={expense._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {expense.serialNumber || "-"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {expense.date
                              ? new Date(expense.date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {expense.description || "-"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className="capitalize">
                              {expense.category || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ₹{(expense.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className="capitalize">
                              {expense.paymentType ||
                                expense.paymentMethod ||
                                "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                expense.status
                              )}`}
                            >
                              {expense.status || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {expense.billUrl || expense.receiptUrl ? (
                              <a
                                href={expense.billUrl || expense.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                title="View Bill/Receipt"
                              >
                                Receipt
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No receipt
                              </span>
                            )}
                          </td>

                          {/* Only show Details column for admin */}
                          {user?.role === "admin" && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleViewDetails(expense)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
                                title="View Details"
                              >
                                <FiEye className="w-3 h-3 mr-1" />
                                Details
                              </button>
                            </td>
                          )}

                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {/* Edit button - only for expense creator when pending */}
                              {canEdit && (
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-blue-700 cursor-pointer hover:bg-blue-200 transition-colors duration-200"
                                  title="Edit Expense"
                                >
                                  <FiEdit className="w-3 h-3 mr-1" />
                                </button>
                              )}

                              {/* Admin approval buttons */}
                              {canApproveReject && (
                                <>
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        open: true,
                                        action: "approve",
                                        expenseId: expense._id,
                                      })
                                    }
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                                  >
                                    <FiCheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        open: true,
                                        action: "reject",
                                        expenseId: expense._id,
                                      })
                                    }
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                                  >
                                    <FiXCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Show dash if no actions available */}
                              {!canEdit && !canApproveReject && (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* View All/Show Less Button */}
              {filteredExpenses.length > 10 && (
                <div className="flex justify-center py-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAllExpenses(!showAllExpenses)}
                    className="inline-flex cursor-pointer items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    {showAllExpenses ? (
                      <>
                        Show Less <span className="ml-1">↑</span>
                      </>
                    ) : (
                      <>
                        View All Expenses <span className="ml-1">↓</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Card Layout */}
          <div className="lg:hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="animate-spin h-6 w-6 mr-3 text-blue-500"
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
                <span className="text-gray-600">Loading expenses...</span>
              </div>
            ) : displayedExpenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No expenses found
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {displayedExpenses.map((expense) => {
                    // Check permissions for mobile view
                    const canEdit =
                      expense.status === "pending" &&
                      (user?.role === "admin" ||
                        expense.createdBy?._id === user?._id ||
                        expense.createdBy?.toString() === user?.id ||
                        expense.createdBy === user?.id);

                    const canApproveReject =
                      user?.role === "admin" && expense.status === "pending";

                    return (
                      <div
                        key={expense._id}
                        className="p-4 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                #{expense.serialNumber || "-"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {expense.date
                                  ? new Date(expense.date).toLocaleDateString()
                                  : "-"}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              {expense.description || "-"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                              <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                                {expense.category || "-"}
                              </span>
                              <span className="capitalize">
                                {expense.paymentType ||
                                  expense.paymentMethod ||
                                  "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{(expense.amount || 0).toLocaleString()}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                expense.status
                              )}`}
                            >
                              {expense.status || "pending"}
                            </span>
                          </div>

                          {/* Receipt in mobile view */}
                          <div>
                            {expense.billUrl || expense.receiptUrl ? (
                              <a
                                href={expense.billUrl || expense.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-200"
                                title="View Receipt"
                              >
                                <FiEye className="w-3 h-3 mr-1" />
                                Receipt
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No receipt
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions in mobile view */}
                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* Only show Details button for admin in mobile */}
                          {user?.role === "admin" && (
                            <button
                              onClick={() => handleViewDetails(expense)}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors duration-200"
                              title="View Details"
                            >
                              <FiEye className="w-3 h-3 mr-1" />
                              Details
                            </button>
                          )}

                          {/* Edit button for mobile */}
                          {canEdit && (
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-200"
                              title="Edit Expense"
                            >
                              <FiEdit2 className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                          )}

                          {/* Admin buttons for mobile */}
                          {canApproveReject && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    open: true,
                                    action: "approve",
                                    expenseId: expense._id,
                                  })
                                }
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors duration-200"
                              >
                                <FiCheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    open: true,
                                    action: "reject",
                                    expenseId: expense._id,
                                  })
                                }
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors duration-200"
                              >
                                <FiXCircle className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile View All/Show Less Button */}
                {filteredExpenses.length > 10 && (
                  <div className="flex justify-center p-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAllExpenses(!showAllExpenses)}
                      className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      {showAllExpenses ? (
                        <>
                          Show Less <span className="ml-1">↑</span>
                        </>
                      ) : (
                        <>
                          View All Expenses <span className="ml-1">↓</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Add Expense Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
            <div className="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
              {/* <button
                className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-700 text-xl"
                onClick={closeModal}
              >
                &times;
              </button> */}
              <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Expense
                </h3>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-6 pt-4 space-y-5"
                id="expenseForm"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={form.serialNumber || "Auto-generated"}
                    readOnly
                    className={`w-full px-4 py-3 text-base ${
                      serialNumberLoading ? "bg-gray-200" : "bg-gray-100"
                    } border border-gray-300 rounded-lg cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Category *
                  </label>
                  {showNewCategoryInput ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const categoryName = newCategory.trim();
                              if (categoryName) {
                                if (!categories.includes(categoryName)) {
                                  setCategories((prev) => [
                                    ...prev,
                                    categoryName,
                                  ]);
                                  setForm((prev) => ({
                                    ...prev,
                                    category: categoryName,
                                  }));
                                  setNewCategory("");
                                  setShowNewCategoryInput(false);
                                  toast.success("Category added successfully", {
                                    duration: 3000,
                                    position: "top-right",
                                  });
                                } else {
                                  toast.error("Category already exists", {
                                    duration: 3000,
                                    position: "top-right",
                                  });
                                }
                              } else {
                                toast.error("Category name cannot be empty", {
                                  duration: 3000,
                                  position: "top-right",
                                });
                              }
                            }
                          }}
                          placeholder="Enter new category and press Enter"
                          className="w-full px-4 py-3 text-base pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (newCategory.trim()) {
                              if (!categories.includes(newCategory.trim())) {
                                setCategories((prev) => [
                                  ...prev,
                                  newCategory.trim(),
                                ]);
                                setForm((prev) => ({
                                  ...prev,
                                  category: newCategory.trim(),
                                }));
                                setNewCategory("");
                                setShowNewCategoryInput(false);
                                toast.success("Category added successfully");
                              } else {
                                toast.error("Category already exists");
                              }
                            } else {
                              toast.error("Category name cannot be empty");
                            }
                          }}
                          className="flex-1 px-4 py-3 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 touch-manipulation"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setNewCategory("");
                          }}
                          className="flex-1 px-4 py-3 text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 touch-manipulation"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                      <option value="__add_new__">+ Add New Category</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentType"
                    value={form.paymentType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter expense description"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium cursor-pointer text-gray-700 mb-2">
                    Upload Bill
                  </label>
                  <input
                    type="file"
                    name="billFile"
                    accept="image/*,application/pdf"
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base cursor-pointer border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="sticky bottom-0 bg-white pt-6 pb-6 border-t border-gray-200 -mx-6 px-6">
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 rounded-lg cursor-pointer py-4 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 touch-manipulation min-h-[48px]"
                      onClick={() => {
                        console.log("Submit button clicked");
                        // The form's onSubmit should handle this, but as a fallback:
                        if (!formLoading) {
                          document
                            .getElementById("expenseForm")
                            .requestSubmit();
                        }
                      }}
                    >
                      {formLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          Processing...
                        </>
                      ) : (
                        "Add Expense"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={formLoading}
                      className="flex-1 rounded-lg py-4 text-base cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation min-h-[48px]"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Expense Modal */}
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
            <div className="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Expense
                </h3>
              </div>
              <form
                onSubmit={handleEditSubmit}
                className="p-6 pt-4 space-y-5"
                id="editExpenseForm"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={editForm.serialNumber || ""}
                    readOnly
                    className="w-full px-4 py-3 text-base bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Category *
                  </label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentType"
                    value={editForm.paymentType}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    placeholder="Enter expense description"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Bill
                  </label>
                  {editForm.billUrl && (
                    <p className="text-sm text-gray-500 mb-2">
                      Current bill:{" "}
                      <a
                        href={editForm.billUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </p>
                  )}
                  <input
                    type="file"
                    name="billFile"
                    accept="image/*,application/pdf"
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 text-base cursor-pointer border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep existing bill
                  </p>
                </div>

                <div className="sticky bottom-0 bg-white pt-6 pb-6 border-t border-gray-200 -mx-6 px-6">
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={editFormLoading}
                      className="flex-1 rounded-lg cursor-pointer py-4 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 touch-manipulation min-h-[48px]"
                    >
                      {editFormLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                        "Update Expense"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={editFormLoading}
                      className="flex-1 rounded-lg py-4 text-base cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation min-h-[48px]"
                      onClick={closeEditModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {viewDetailsModal && viewingExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
            <div className="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Expense Details
                  </h3>
                  <button
                    onClick={closeViewDetailsModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {viewingExpense.serialNumber || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {viewingExpense.date
                        ? new Date(viewingExpense.date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded capitalize">
                      {viewingExpense.category || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <p className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      ₹{(viewingExpense.amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded capitalize">
                      {viewingExpense.paymentType ||
                        viewingExpense.paymentMethod ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        viewingExpense.status
                      )}`}
                    >
                      {viewingExpense.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {viewingExpense.description || "-"}
                  </p>
                </div>

                {/* Created By Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created By
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded">
                    <p className="text-sm font-medium text-gray-900">
                      {viewingExpense.createdBy?.name ||
                        viewingExpense.createdBy?.username ||
                        "Unknown User"}
                    </p>
                    {viewingExpense.createdBy?.email && (
                      <p className="text-xs text-gray-600">
                        {viewingExpense.createdBy.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {viewingExpense.createdAt
                        ? new Date(viewingExpense.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  {viewingExpense.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {new Date(viewingExpense.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Receipt Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt/Bill
                  </label>
                  {viewingExpense.billUrl || viewingExpense.receiptUrl ? (
                    <div className="flex items-center space-x-3">
                      <a
                        href={
                          viewingExpense.billUrl || viewingExpense.receiptUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                      >
                        <FiEye className="w-4 h-4 mr-2" />
                        View Receipt
                      </a>
                      <span className="text-sm text-gray-500">
                        Receipt available
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
                      No receipt uploaded
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                {viewingExpense.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {viewingExpense.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={closeViewDetailsModal}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Confirmation Modal */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative flex flex-col items-center">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() =>
                    setConfirmModal({
                      open: false,
                      action: null,
                      expenseId: null,
                    })
                  }
                  className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <div className="mb-4 flex flex-col items-center">
                <div
                  className={`mb-2 text-4xl ${
                    confirmModal.action === "approve"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {confirmModal.action === "approve" ? (
                    <FiCheckCircle />
                  ) : (
                    <FiXCircle />
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2 text-center">
                  {confirmModal.action === "approve"
                    ? "Approve Expense?"
                    : "Reject Expense?"}
                </h2>
                <p className="text-gray-600 text-center">
                  Are you sure you want to {confirmModal.action} this expense?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 mt-4 w-full">
                <button
                  className={`flex-1 py-3 cursor-pointer rounded-lg font-semibold text-white ${
                    confirmModal.action === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } transition-colors duration-200 focus:outline-none`}
                  onClick={async () => {
                    if (confirmModal.action === "approve") {
                      await handleApprove(confirmModal.expenseId);
                    } else {
                      await handleReject(confirmModal.expenseId);
                    }
                    setConfirmModal({
                      open: false,
                      action: null,
                      expenseId: null,
                    });
                  }}
                >
                  Confirm
                </button>
                <button
                  className="flex-1 py-3 cursor-pointer rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none"
                  onClick={() =>
                    setConfirmModal({
                      open: false,
                      action: null,
                      expenseId: null,
                    })
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
