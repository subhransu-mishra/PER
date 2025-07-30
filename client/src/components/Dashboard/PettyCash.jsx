import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { FaPlus, FaDownload } from "react-icons/fa6";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { MdAccountBalanceWallet } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { IoAnalyticsSharp } from "react-icons/io5";
import { FiEye, FiEdit } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyVoucher = {
  voucherNumber: "",
  date: format(new Date(), "yyyy-MM-dd"),
  transactionType: "cash",
  categoryType: "",
  description: "",
  amount: "",
  receipt: null,
  status: "pending",
};

const PettyCash = () => {
  // Confirmation modal state for approve/reject
  const [viewVoucher, setViewVoucher] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null, // 'approve' | 'reject'
    voucherId: null,
  });

  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(emptyVoucher);
  const [editForm, setEditForm] = useState(emptyVoucher);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [monthlyApproved, setMonthlyApproved] = useState({
    totalApproved: 0,
    count: 0,
    month: "",
    year: "",
  });
  const [editingVoucher, setEditingVoucher] = useState(null); // Ensure this is defined

  const getCurrentMonthDates = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: format(startOfMonth, "yyyy-MM-dd"),
      end: format(endOfMonth, "yyyy-MM-dd"),
    };
  };

  const [filters, setFilters] = useState({
    startDate: getCurrentMonthDates().start,
    endDate: getCurrentMonthDates().end,
    status: "",
    page: 1,
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  // Current authenticated user
  const { user } = useAuth();

  // Enhanced role checking with multiple fallbacks
  const getUserRole = () => {
    if (!user) return "user";

    // Check multiple possible role fields
    const role = user.role || user.userRole || user.accountType || user.type;

    // Normalize role to lowercase for comparison
    if (typeof role === "string") {
      return role.toLowerCase();
    }

    // Default to user if no valid role found
    return "user";
  };

  const isAdmin = () => {
    const role = getUserRole();
    // Check for various admin role variations
    return ["admin", "administrator", "super_admin", "superadmin"].includes(
      role
    );
  };

  // Debug logging for role checking (remove in production)
  useEffect(() => {
    console.log("Current user:", user);
    console.log("User role:", getUserRole());
    console.log("Is admin:", isAdmin());
  }, [user]);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to access this page");
      return;
    }

    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Authentication token not found. Please log in again.");
          return;
        }

        const queryParams = new URLSearchParams({
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          ...(filters.status && { status: filters.status }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(search && { search }),
        });

        const res = await axios.get(
          `${API_BASE_URL}/api/pettycash?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.entries) {
          setVouchers(res.data.entries);
          setPagination(res.data.pagination);
        } else {
          console.error("Invalid response structure:", res.data);
          toast.error("Invalid response from server");
        }
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          // Optionally redirect to login
        } else {
          toast.error("Failed to fetch petty cash entries");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const queryParams = new URLSearchParams({
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

        const res = await axios.get(
          `${API_BASE_URL}/api/pettycash/stats?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setStats(res.data.stats);
        } else {
          console.error("Failed to fetch statistics:", res.data.message);
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };

    const fetchMonthlyApprovedTotal = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${API_BASE_URL}/api/pettycash/monthly-approved-total`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setMonthlyApproved(response.data.data);
        } else {
          console.error(
            "Failed to fetch monthly approved total:",
            response.data.message
          );
          setMonthlyApproved({
            totalApproved: 0,
            count: 0,
            month: format(new Date(), "MMMM"),
            year: new Date().getFullYear(),
          });
        }
      } catch (error) {
        console.error("Error fetching monthly approved total:", error);
        setMonthlyApproved({
          totalApproved: 0,
          count: 0,
          month: format(new Date(), "MMMM"),
          year: new Date().getFullYear(),
        });
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchVouchers(),
          fetchStats(),
          fetchMonthlyApprovedTotal(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, search, user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Update the existing handleChange to work with both forms
  const handleChange = (e) => {
    if (isEditing) {
      return handleEditChange(e);
    }

    const { name, value, type, files } = e.target;
    if (type === "file") {
      setReceiptFile(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchNextVoucherNumber = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const res = await axios.get(
        `${API_BASE_URL}/api/pettycash/next-voucher`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setForm((prev) => ({
        ...prev,
        voucherNumber: res.data.nextVoucherNumber,
      }));
    } catch (err) {
      console.error("Error fetching next voucher number:", err);
      toast.error("Failed to generate voucher number");
    }
  };

  // Add helper function to check if entry can be edited (within 24 hours and by creator)
  const canEditVoucher = (voucher) => {
    if (!user || !voucher) return false;

    // Check if voucher is pending
    if (voucher.status !== "pending") return false;

    // Check if current user is the creator
    const isCreator =
      voucher.createdBy?._id === user.id || voucher.createdBy?._id === user._id;
    if (!isCreator) return false;

    // Check if within 24 hours
    const now = new Date();
    const createdAt = new Date(voucher.createdAt);
    const diffInHours = (now - createdAt) / (1000 * 60 * 60);

    return diffInHours <= 24;
  };

  // Handle edit voucher
  const handleEditVoucher = (voucher) => {
    setEditingVoucher(voucher);
    setEditForm({
      voucherNumber: voucher.voucherNumber,
      date: format(new Date(voucher.date), "yyyy-MM-dd"),
      transactionType: voucher.transactionType,
      categoryType: voucher.categoryType,
      description: voucher.description,
      amount: voucher.amount.toString(),
      receipt: null, // Can't pre-fill file input
    });
    setReceiptFile(null);
    setIsEditing(true);
    setShowModal(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setReceiptFile(files[0]);
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !editForm.date ||
      !editForm.transactionType ||
      !editForm.categoryType ||
      !editForm.description ||
      !editForm.amount
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const formData = new FormData();
      formData.append("date", editForm.date);
      formData.append("transactionType", editForm.transactionType);
      formData.append("categoryType", editForm.categoryType);
      formData.append("description", editForm.description);
      formData.append("amount", Number(editForm.amount));

      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const res = await axios.put(
        `${API_BASE_URL}/api/pettycash/${editingVoucher._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Petty cash entry updated successfully");

        // Update the vouchers list
        setVouchers((prev) =>
          prev.map((v) => (v._id === editingVoucher._id ? res.data.entry : v))
        );

        // Close modal and reset states
        setShowModal(false);
        setIsEditing(false);
        setEditingVoucher(null);
        setEditForm(emptyVoucher);
        setReceiptFile(null);
      } else {
        toast.error(res.data.message || "Failed to update entry");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update petty cash entry"
      );
      console.error("Error updating petty cash entry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the existing handleSubmit to handle both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      await handleEditSubmit(e);
      return;
    }

    // Create new entry logic
    if (
      !form.voucherNumber ||
      !form.date ||
      !form.transactionType ||
      !form.categoryType ||
      !form.description ||
      !form.amount
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!receiptFile) {
      toast.error("Receipt required in petty cash entry form");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("voucherNumber", form.voucherNumber);
      formData.append("date", form.date);
      formData.append("transactionType", form.transactionType);
      formData.append("categoryType", form.categoryType);
      formData.append("description", form.description);
      formData.append("amount", Number(form.amount));
      formData.append("receipt", receiptFile);

      const res = await axios.post(
        `${API_BASE_URL}/api/pettycash/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Petty cash entry created successfully");
      setVouchers((prev) => [res.data.entry, ...prev]);
      setForm(emptyVoucher);
      setReceiptFile(null);
      setShowModal(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create petty cash entry"
      );
      console.error(
        "Error creating petty cash entry:",
        err.response?.data || err.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced approve function with admin check
  const handleApprove = async (id) => {
    // Double-check admin status before proceeding
    if (!isAdmin()) {
      toast.error("Unauthorized: Only administrators can approve vouchers");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/pettycash/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setVouchers((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: "approved" } : v))
        );
        setStats((prev) => ({
          ...prev,
          pendingAmount: prev.pendingAmount - response.data.entry.amount,
          pendingCount: prev.pendingCount - 1,
          approvedAmount: prev.approvedAmount + response.data.entry.amount,
          approvedCount: prev.approvedCount + 1,
        }));
        toast.success("Voucher approved successfully");
      } else {
        toast.error(response.data.message || "Failed to approve voucher");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          "Unauthorized: Insufficient privileges to approve vouchers"
        );
      } else {
        toast.error(err.response?.data?.message || "Failed to approve voucher");
      }
      console.error("Error approving voucher:", err);
    }
  };

  // Enhanced reject function with admin check
  const handleReject = async (id) => {
    // Double-check admin status before proceeding
    if (!isAdmin()) {
      toast.error("Unauthorized: Only administrators can reject vouchers");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/pettycash/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setVouchers((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: "rejected" } : v))
        );
        setStats((prev) => ({
          ...prev,
          pendingAmount: prev.pendingAmount - response.data.entry.amount,
          pendingCount: prev.pendingCount - 1,
          rejectedAmount: prev.rejectedAmount + response.data.entry.amount,
          rejectedCount: prev.rejectedCount + 1,
        }));
        toast.success("Voucher rejected successfully");
      } else {
        toast.error(response.data.message || "Failed to reject voucher");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Unauthorized: Insufficient privileges to reject vouchers");
      } else {
        toast.error(err.response?.data?.message || "Failed to reject voucher");
      }
      console.error("Error rejecting voucher:", err);
    }
  };

  const handleViewVoucherDetails = (voucher) => {
    setViewVoucher(voucher);
  };

  const closeViewModal = () => {
    setViewVoucher(null);
  };

  const handleNewVoucher = async () => {
    setForm({
      ...emptyVoucher,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setIsEditing(false);
    setShowModal(true);
    await fetchNextVoucherNumber();
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const queryParams = new URLSearchParams();

      if (filters.startDate) queryParams.append("from", filters.startDate);
      if (filters.endDate) queryParams.append("to", filters.endDate);

      const response = await axios.get(
        `${API_BASE_URL}/api/export/pettycash?${queryParams}`,
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
      const fromDate = filters.startDate
        ? format(new Date(filters.startDate), "dd-MM-yyyy")
        : "all";
      const toDate = filters.endDate
        ? format(new Date(filters.endDate), "dd-MM-yyyy")
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

  // Update closeModal to handle edit state
  const closeModal = () => {
    setShowModal(false);
    setForm(emptyVoucher);
    setEditForm(emptyVoucher);
    setReceiptFile(null);
    setIsEditing(false);
    setEditingVoucher(null);
  };

  // Enhanced confirmation modal handler with admin check
  const handleConfirmAction = async () => {
    if (!isAdmin()) {
      toast.error(
        "Unauthorized: Only administrators can approve/reject vouchers"
      );
      setConfirmModal({
        open: false,
        action: null,
        voucherId: null,
      });
      return;
    }

    if (confirmModal.action === "approve") {
      await handleApprove(confirmModal.voucherId);
    } else if (confirmModal.action === "reject") {
      await handleReject(confirmModal.voucherId);
    }

    setConfirmModal({
      open: false,
      action: null,
      voucherId: null,
    });
  };

  // Enhanced action button render function
  const renderActionButtons = (voucher) => {
    const adminRole = isAdmin();
    const isPending = voucher.status === "pending";

    return (
      <div className="flex items-center gap-2">
        {voucher.receipt && (
          <a
            href={voucher.receipt}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-blue-700 bg-blue-100 hover:bg-blue-200 touch-manipulation"
          >
            Receipt
          </a>
        )}

        {/* Only show approve/reject buttons for admin users on pending vouchers */}
        {adminRole && isPending && (
          <>
            <button
              onClick={() =>
                setConfirmModal({
                  open: true,
                  action: "approve",
                  voucherId: voucher._id,
                })
              }
              className="px-2 py-1 cursor-pointer border border-transparent text-xs rounded text-green-700 bg-green-100 hover:bg-green-200 touch-manipulation transition-colors duration-200"
              title="Approve voucher (Admin only)"
            >
              Approve
            </button>
            <button
              onClick={() =>
                setConfirmModal({
                  open: true,
                  action: "reject",
                  voucherId: voucher._id,
                })
              }
              className="px-2 py-1 cursor-pointer border border-transparent text-xs rounded text-red-700 bg-red-100 hover:bg-red-200 touch-manipulation transition-colors duration-200"
              title="Reject voucher (Admin only)"
            >
              Reject
            </button>
          </>
        )}

        {/* Show message for non-admin users when voucher is pending */}
        {!adminRole && isPending && (
          <span className="text-xs text-gray-500 italic">
            Pending admin approval
          </span>
        )}
      </div>
    );
  };

  // Show loading or unauthorized message if user is not available
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-2">
            Please log in to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 py-2 sm:p-6 max-w-full">
      {/* Admin Status Indicator (for debugging - remove in production) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Debug: User Role: {getUserRole()} | Is Admin: {isAdmin() ? 'Yes' : 'No'}
          </p>
        </div>
      )} */}

      {/* Stats Section - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Petty Cash Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Pettycash Spend
              </p>
              <h3 className="text-xl font-bold text-red-600 mb-1">
                ₹{(stats.totalAmount || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500">
                {format(new Date(), "MMMM yyyy")} includes all vouchers
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <MdAccountBalanceWallet className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Approved This Month Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Approved this Month
              </p>
              <h3 className="text-xl font-bold text-green-600 mb-1">
                ₹{monthlyApproved.totalApproved.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500">
                {monthlyApproved.count} approved in {monthlyApproved.month}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Pending Vouchers Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Pending Vouchers
              </p>
              <h3 className="text-xl font-bold text-amber-500 mb-1">
                {stats.pendingCount || 0} vouchers
              </h3>
              <p className="text-xs text-gray-500">
                ₹{(stats.pendingAmount || 0).toLocaleString()} pending
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <TbMoneybag className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Total Vouchers Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Vouchers
              </p>
              <h3 className="text-xl font-bold text-blue-600 mb-1">
                {(stats.pendingCount || 0) +
                  (stats.approvedCount || 0) +
                  (stats.rejectedCount || 0)}{" "}
                vouchers
              </h3>
              <p className="text-xs text-gray-500">
                Issued in {format(new Date(), "MMMM yyyy")}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <IoAnalyticsSharp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Header with Filters */}
      <div className="bg-white p-3 rounded-lg shadow mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            Petty Cash Management
            {isAdmin() && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Admin
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <FaDownload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleNewVoucher}
              className="px-3 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vouchers..."
              className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Vouchers Responsive List */}
      {/* Desktop Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voucher #
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edit
              </th>
              {/* Only show Details column for admin */}
              {isAdmin() && (
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={isAdmin() ? "9" : "8"}
                  className="px-3 py-4 text-center text-sm"
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
                    Loading vouchers...
                  </div>
                </td>
              </tr>
            ) : vouchers.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin() ? "9" : "8"}
                  className="px-3 py-4 text-center text-sm text-gray-500"
                >
                  No vouchers found
                </td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr
                  key={voucher._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                    {voucher.voucherNumber}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {new Date(voucher.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {voucher.categoryType}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm max-w-[120px]">
                    <div className="truncate" title={voucher.description}>
                      {voucher.description}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold">
                    ₹{voucher.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        voucher.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : voucher.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {voucher.status.charAt(0).toUpperCase() +
                        voucher.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap flex items-center space-x-2">
                    {renderActionButtons(voucher)}
                  </td>
                  {/* New Edit Column */}
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    {canEditVoucher(voucher) ? (
                      <button
                        onClick={() => handleEditVoucher(voucher)}
                        className="p-1 cursor-pointer rounded hover:bg-blue-50 transition text-blue-600"
                        title="Edit Voucher"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-gray-300">
                        <FiEdit className="w-4 h-4 mx-auto" />
                      </span>
                    )}
                  </td>
                  {/* Only show Details column for admin */}
                  {isAdmin() && (
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleViewVoucherDetails(voucher)}
                        className="p-1 cursor-pointer rounded hover:bg-gray-100 transition"
                        title="View Voucher Details"
                      >
                        <FiEye className="text-blue-600 w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Desktop Pagination Controls */}
        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {/* Mobile pagination */}
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  filters.page <= 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= pagination.totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  filters.page >= pagination.totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(filters.page - 1) * filters.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  vouchers
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      filters.page <= 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {(() => {
                    const pages = [];
                    const totalPages = pagination.totalPages;
                    const currentPage = filters.page;

                    // Calculate which pages to show
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, currentPage + 2);

                    // Adjust if we're near the beginning or end
                    if (currentPage <= 3) {
                      endPage = Math.min(5, totalPages);
                    }
                    if (currentPage > totalPages - 3) {
                      startPage = Math.max(1, totalPages - 4);
                    }

                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span
                            key="ellipsis1"
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                    }

                    // Add page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                            i === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Add last page and ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span
                            key="ellipsis2"
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      filters.page >= pagination.totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center">
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
              <span className="text-gray-600">Loading vouchers...</span>
            </div>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No vouchers found
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {vouchers.map((voucher) => (
                <div
                  key={voucher._id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {voucher.voucherNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            voucher.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : voucher.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {voucher.status.charAt(0).toUpperCase() +
                            voucher.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {voucher.description}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                        <span className="bg-blue-50 px-2 py-1 rounded">
                          {voucher.categoryType}
                        </span>
                        <span>
                          {new Date(voucher.date).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-base font-bold text-gray-900">
                      ₹{voucher.amount.toLocaleString("en-IN")}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Only show Details button for admin in mobile */}
                      {isAdmin() && (
                        <button
                          onClick={() => handleViewVoucherDetails(voucher)}
                          className="p-1 cursor-pointer rounded hover:bg-gray-100 transition"
                          title="View Voucher Details"
                        >
                          <FiEye className="text-blue-600 w-4 h-4" />
                        </button>
                      )}
                      {/* Add Edit Button for Mobile */}
                      {canEditVoucher(voucher) && (
                        <button
                          onClick={() => handleEditVoucher(voucher)}
                          className="p-1 cursor-pointer rounded hover:bg-blue-50 transition text-blue-600"
                          title="Edit Voucher"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                      {renderActionButtons(voucher)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Pagination Controls */}
            {pagination.total > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      filters.page <= 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">
                      Page {filters.page} of {pagination.totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= pagination.totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      filters.page >= pagination.totalPages
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Mobile voucher count */}
            {pagination.total > 0 && (
              <div className="bg-gray-50 px-4 py-2 text-center">
                <p className="text-xs text-gray-600">
                  Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                  {Math.min(filters.page * filters.limit, pagination.total)} of{" "}
                  {pagination.total} vouchers
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Updated Modal to handle both create and edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-2 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">
                {isEditing ? "Edit Entry" : "New Entry"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Voucher Number
                </label>
                <input
                  type="text"
                  name="voucherNumber"
                  value={
                    isEditing ? editForm.voucherNumber : form.voucherNumber
                  }
                  readOnly
                  className="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-xs sm:text-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Date*
                </label>
                <input
                  type="date"
                  name="date"
                  value={isEditing ? editForm.date : form.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border-gray-300 text-xs sm:text-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Transaction Type*
                </label>
                <select
                  name="transactionType"
                  value={
                    isEditing ? editForm.transactionType : form.transactionType
                  }
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border-gray-300 text-xs sm:text-sm p-2"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Category Type*
                </label>
                <input
                  type="text"
                  name="categoryType"
                  value={isEditing ? editForm.categoryType : form.categoryType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border-gray-300 text-xs sm:text-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={isEditing ? editForm.description : form.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border-gray-300 text-xs sm:text-sm p-2"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Amount*
                </label>
                <input
                  type="number"
                  name="amount"
                  value={isEditing ? editForm.amount : form.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border-gray-300 text-xs sm:text-sm p-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Receipt {isEditing && "(Optional - upload new to replace)"}
                </label>
                <input
                  type="file"
                  name="receipt"
                  onChange={handleChange}
                  accept="image/*,.pdf"
                  className="mt-1 block w-full text-xs sm:text-sm text-gray-500"
                  required={!isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep current receipt
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="w-full cursor-pointer sm:w-auto justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer sm:w-auto justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      {isEditing ? "Updating..." : "Processing..."}
                    </>
                  ) : isEditing ? (
                    "Update Entry"
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Confirmation Modal for Approve/Reject - Only for Admins */}
      {confirmModal.open && isAdmin() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative flex flex-col items-center">
            <div className="absolute top-4 right-4">
              <button
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    action: null,
                    voucherId: null,
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
                  ? "Approve Voucher?"
                  : "Reject Voucher?"}
              </h2>
              <p className="text-gray-600 text-center">
                Are you sure you want to {confirmModal.action} this voucher?
                This action cannot be undone.
              </p>
              <div className="mt-2 px-3 py-1 bg-blue-50 rounded-full">
                <span className="text-xs text-blue-800 font-medium">
                  Admin Action Required
                </span>
              </div>
            </div>
            <div className="flex gap-4 mt-4 w-full">
              <button
                className={`flex-1 py-3 cursor-pointer rounded-lg font-semibold text-white ${
                  confirmModal.action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } transition-colors duration-200 focus:outline-none`}
                onClick={handleConfirmAction}
              >
                Confirm{" "}
                {confirmModal.action === "approve" ? "Approval" : "Rejection"}
              </button>
              <button
                className="flex-1 py-3 cursor-pointer rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    action: null,
                    voucherId: null,
                  })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Detail View Modal */}
      {viewVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white/95 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 backdrop-blur-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Voucher Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    #{viewVoucher.voucherNumber}
                  </p>
                </div>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(viewVoucher.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ₹
                    {parseFloat(viewVoucher.amount).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Transaction Type
                  </h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {viewVoucher.transactionType}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Category
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewVoucher.categoryType}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Description
                  </h3>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {viewVoucher.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span
                    className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewVoucher.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : viewVoucher.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {viewVoucher.status.charAt(0).toUpperCase() +
                      viewVoucher.status.slice(1)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Created By
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewVoucher.createdBy?.name ||
                      viewVoucher.createdBy?.username ||
                      viewVoucher.createdBy?.email ||
                      "N/A"}
                  </p>
                </div>

                {viewVoucher.receipt && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Receipt
                    </h3>
                    <div className="mt-1">
                      <a
                        href={viewVoucher.receipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          className="-ml-0.5 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Receipt
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="px-4 py-2 border cursor-pointer border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unauthorized Access Modal - Shows when non-admin tries to access admin features */}
      {confirmModal.open && !isAdmin() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative flex flex-col items-center">
            <div className="mb-4 flex flex-col items-center">
              <div className="mb-2 text-4xl text-red-500">
                <FiXCircle />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Access Denied
              </h2>
              <p className="text-gray-600 text-center">
                Only administrators can approve or reject vouchers.
              </p>
              <div className="mt-2 px-3 py-1 bg-red-50 rounded-full">
                <span className="text-xs text-red-800 font-medium">
                  Current Role: {getUserRole()}
                </span>
              </div>
            </div>
            <button
              className="w-full py-3 cursor-pointer rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none"
              onClick={() =>
                setConfirmModal({
                  open: false,
                  action: null,
                  voucherId: null,
                })
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PettyCash;
