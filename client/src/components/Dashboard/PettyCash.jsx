import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa6";

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
  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(emptyVoucher);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monthlyApproved, setMonthlyApproved] = useState({
    totalApproved: 0,
    count: 0,
    month: "",
    year: "",
  });
  // Get current month's start and end dates
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
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Get role from user data
  const role = user?.role || "user";

  // Fetch data on mount and when filters change
  useEffect(() => {
    if (!user) return;

    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
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

        setVouchers(res.data.entries);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        toast.error("Failed to fetch petty cash entries");
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
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

  // Make these functions available outside the useEffect
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
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

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setReceiptFile(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fetch vouchers on component mount
  useEffect(() => {
    if (!user) return;
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/pettycash", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVouchers(res.data.entries || []);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        toast.error("Failed to fetch petty cash entries");
        setVouchers([]);
      }
    };
    fetchVouchers();
  }, [user]);

  // Fetch next voucher number
  const fetchNextVoucherNumber = async () => {
    try {
      const token = localStorage.getItem("token");
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
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

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append all form fields to FormData
      formData.append("voucherNumber", form.voucherNumber);
      formData.append("date", form.date);
      formData.append("transactionType", form.transactionType);
      formData.append("categoryType", form.categoryType);
      formData.append("description", form.description);
      formData.append("amount", Number(form.amount));

      // Append receipt file if exists
      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

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
    }
  };

  // Handle approve/reject actions
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/api/pettycash/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update the voucher in the local state
        setVouchers((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: "approved" } : v))
        );

        // Refresh statistics to update counts and totals
        fetchStats();
        fetchMonthlyApprovedTotal();

        toast.success("Voucher approved successfully");
      } else {
        toast.error(response.data.message || "Failed to approve voucher");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve voucher");
      console.error("Error approving voucher:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/api/pettycash/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update the voucher in the local state
        setVouchers((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: "rejected" } : v))
        );

        // Refresh statistics to update counts and totals
        fetchStats();

        toast.success("Voucher rejected successfully");
      } else {
        toast.error(response.data.message || "Failed to reject voucher");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject voucher");
      console.error("Error rejecting voucher:", err);
    }
  };

  // Modal handlers
  const handleNewVoucher = async () => {
    setForm({
      ...emptyVoucher,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setIsEditing(false);
    setShowModal(true);
    await fetchNextVoucherNumber();
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyVoucher);
    setReceiptFile(null);
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Total pettycash spend
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-red-600">
            ₹{(stats.totalAmount || 0).toLocaleString()}
          </p>
          <span className="text-xs text-gray-500">
            {format(new Date(), "MMMM yyyy")} includes all vouchers
          </span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Approved pettycash This Month
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            ₹{monthlyApproved.totalApproved.toLocaleString()}
          </p>
          <span className="text-xs text-gray-500">
            {monthlyApproved.count} approved vouchers in {monthlyApproved.month}{" "}
            {monthlyApproved.year}
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Pending Vouchers
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">
            {stats.pendingCount || 0} vouchers
          </p>
          <span className="text-xs text-gray-500">
            ₹{(stats.pendingAmount || 0).toLocaleString()} pending approval
          </span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Total Vouchers
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            {(stats.pendingCount || 0) +
              (stats.approvedCount || 0) +
              (stats.rejectedCount || 0)}{" "}
            vouchers
          </p>
          <span className="text-xs text-gray-500">
            Issued in {format(new Date(), "MMMM yyyy")}
          </span>
        </div>
      </div>

      {/* Header with Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-0">
            Petty Cash Management
          </h1>
          <button
            onClick={handleNewVoucher}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center"
          >
            <FaPlus className="inline-block mr-1" />
            New Entry
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full text-xs sm:text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2"
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
              className="w-full text-xs sm:text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2"
            />
          </div>
          <div>
            <label className="cursor-pointer block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full text-xs sm:text-sm cursor-pointer rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2"
            >
              <option value="" className="cursor-pointer">
                All
              </option>
              <option value="pending" className="cursor-pointer">
                Pending
              </option>
              <option value="approved" className="cursor-pointer">
                Approved
              </option>
              <option value="rejected" className="cursor-pointer">
                Rejected
              </option>
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
              className="w-full text-xs sm:text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2"
            />
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voucher #
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-3 sm:px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 sm:px-6 py-4 text-center">
                    No entries found
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {voucher.voucherNumber}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {new Date(voucher.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                      {voucher.categoryType}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-[120px] sm:max-w-none truncate">
                      {voucher.description}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      ₹{voucher.amount.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
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
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                        {voucher.receipt && (
                          <a
                            href={voucher.receipt}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                          >
                            View Receipt
                          </a>
                        )}
                        {role === "admin" && voucher.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(voucher._id)}
                              className="text-green-600 cursor-pointer hover:text-green-800 text-xs sm:text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(voucher._id)}
                              className="text-red-600 cursor-pointer hover:text-red-800 text-xs sm:text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="hidden sm:flex items-center">
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
                  results
                </p>
              </div>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={!pagination.hasMore}
                className="relative inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 sm:p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {isEditing ? "Edit Petty Cash Entry" : "New Petty Cash Entry"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Voucher Number
                </label>
                <input
                  type="text"
                  name="voucherNumber"
                  value={form.voucherNumber}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date*
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Type*
                </label>
                <select
                  name="transactionType"
                  value={form.transactionType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Type*
                </label>
                <input
                  type="text"
                  name="categoryType"
                  value={form.categoryType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount*
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Receipt (Payment Proof)
                </label>
                <input
                  type="file"
                  name="receipt"
                  onChange={handleChange}
                  accept="image/*,.pdf"
                  className="mt-1 cursor-pointer block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PettyCash;
