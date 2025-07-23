import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { FaPlus, FaDownload } from "react-icons/fa6";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

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
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null, // 'approve' | 'reject'
    voucherId: null,
  });

  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(emptyVoucher);
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

  const role = user?.role || "user";

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

  const handleChange = (e) => {
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

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("voucherNumber", form.voucherNumber);
      formData.append("date", form.date);
      formData.append("transactionType", form.transactionType);
      formData.append("categoryType", form.categoryType);
      formData.append("description", form.description);
      formData.append("amount", Number(form.amount));

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
    } finally {
      setIsSubmitting(false);
    }
  };

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
      toast.error(err.response?.data?.message || "Failed to reject voucher");
      console.error("Error rejecting voucher:", err);
    }
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
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('from', filters.startDate);
      if (filters.endDate) queryParams.append('to', filters.endDate);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/export/pettycash?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with date range
      const fromDate = filters.startDate ? format(new Date(filters.startDate), 'dd-MM-yyyy') : 'all';
      const toDate = filters.endDate ? format(new Date(filters.endDate), 'dd-MM-yyyy') : 'all';
      link.setAttribute('download', `petty-cash-report-${fromDate}-to-${toDate}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.response?.data?.message || 'Failed to export PDF');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyVoucher);
    setReceiptFile(null);
    setIsEditing(false);
  };

  return (
    <div className="px-0 py-2 sm:p-6 max-w-full">
      {/* Stats Section - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">
            Total pettycash spend
          </h3>
          <p className="text-lg sm:text-xl font-bold text-red-600">
            ₹{(stats.totalAmount || 0).toLocaleString()}
          </p>
          <span className="text-xs text-gray-500 truncate">
            {format(new Date(), "MMMM yyyy")} includes all vouchers
          </span>
        </div>
        
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">
            Approved this Month
          </h3>
          <p className="text-lg sm:text-xl font-bold text-green-600">
            ₹{monthlyApproved.totalApproved.toLocaleString()}
          </p>
          <span className="text-xs text-gray-500 truncate">
            {monthlyApproved.count} approved in {monthlyApproved.month}{" "}
            {monthlyApproved.year}
          </span>
        </div>

        <div className="bg-white p-2 sm:p-3 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">
            Pending Vouchers
          </h3>
          <p className="text-lg sm:text-xl font-bold text-yellow-600">
            {stats.pendingCount || 0} vouchers
          </p>
          <span className="text-xs text-gray-500 truncate">
            ₹{(stats.pendingAmount || 0).toLocaleString()} pending
          </span>
        </div>
        
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">
            Total Vouchers
          </h3>
          <p className="text-lg sm:text-xl font-bold text-blue-600">
            {(stats.pendingCount || 0) +
              (stats.approvedCount || 0) +
              (stats.rejectedCount || 0)}{" "}
            vouchers
          </p>
          <span className="text-xs text-gray-500 truncate">
            Issued in {format(new Date(), "MMMM yyyy")}
          </span>
        </div>
      </div>

      {/* Header with Filters */}
      <div className="bg-white p-3 rounded-lg shadow mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            Petty Cash Management
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
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher #</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-3 py-4 text-center text-sm">Loading...</td>
              </tr>
            ) : vouchers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-3 py-4 text-center text-sm">No entries found</td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr key={voucher._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">{voucher.voucherNumber}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">{new Date(voucher.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{voucher.categoryType}</span></td>
                  <td className="px-3 py-3 text-sm max-w-[120px]"><div className="truncate" title={voucher.description}>{voucher.description}</div></td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold">₹{voucher.amount.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 whitespace-nowrap"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${voucher.status === "approved" ? "bg-green-100 text-green-800" : voucher.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}</span></td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {voucher.receipt && (
                        <a href={voucher.receipt} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-blue-700 bg-blue-100 hover:bg-blue-200">Receipt</a>
                      )}
                      {role === "admin" && voucher.status === "pending" && (
                        <>
                          <button onClick={() => setConfirmModal({ open: true, action: 'approve', voucherId: voucher._id })} className="px-2 py-1 cursor-pointer border border-transparent text-xs rounded text-green-700 bg-green-100 hover:bg-green-200">Approve</button>
                          <button onClick={() => setConfirmModal({ open: true, action: 'reject', voucherId: voucher._id })} className="px-2 py-1 cursor-pointer border border-transparent text-xs rounded text-red-700 bg-red-100 hover:bg-red-200">Reject</button>
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

      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No entries found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {vouchers.map((voucher) => (
              <div key={voucher._id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">{voucher.voucherNumber}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${voucher.status === "approved" ? "bg-green-100 text-green-800" : voucher.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">{voucher.description}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                      <span className="bg-blue-50 px-2 py-1 rounded">{voucher.categoryType}</span>
                      <span>{new Date(voucher.date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-base font-bold text-gray-900">₹{voucher.amount.toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-2">
                    {voucher.receipt && (
                      <a href={voucher.receipt} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-blue-700 bg-blue-100 hover:bg-blue-200 touch-manipulation">Receipt</a>
                    )}
                    {role === "admin" && voucher.status === "pending" && (
                      <>
                        <button onClick={() => setConfirmModal({ open: true, action: 'approve', voucherId: voucher._id })} className="px-2 py-1 cursor-pointer border border-transparent text-xs rounded text-green-700 bg-green-100 hover:bg-green-200 touch-manipulation">Approve</button>
                        <button onClick={() => setConfirmModal({ open: true, action: 'reject', voucherId: voucher._id })} className="px-2 py-1 cursor-pointer border border-transparent text-xs rounded text-red-700 bg-red-100 hover:bg-red-200 touch-manipulation">Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-2 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="relative cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={!pagination.hasMore}
              className="ml-3 cursor-pointer relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p className="text-xs text-gray-700">
              Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(filters.page * filters.limit, pagination.total)}
              </span> of <span className="font-medium">{pagination.total}</span> results
            </p>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs"
              >
                Previous
              </button>
              <span className="relative inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-xs">
                Page {filters.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={!pagination.hasMore}
                className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Modal - Responsive Design */}
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
                  value={form.voucherNumber}
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
                  value={form.date}
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
                  value={form.transactionType}
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
                  value={form.categoryType}
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
                  value={form.description}
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
                  value={form.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded border-gray-300 text-xs sm:text-sm p-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Receipt
                </label>
                <input
                  type="file"
                  name="receipt"
                  onChange={handleChange}
                  accept="image/*,.pdf"
                  className="mt-1 block w-full text-xs sm:text-sm text-gray-500"
                />
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
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (isEditing ? "Save" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approve/Reject */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative flex flex-col items-center">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setConfirmModal({ open: false, action: null, voucherId: null })}
                className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="mb-4 flex flex-col items-center">
              <div className={`mb-2 text-4xl ${confirmModal.action === 'approve' ? 'text-green-500' : 'text-red-500'}`}>{confirmModal.action === 'approve' ? <FiCheckCircle /> : <FiXCircle />}</div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                {confirmModal.action === 'approve' ? 'Approve Voucher?' : 'Reject Voucher?'}
              </h2>
              <p className="text-gray-600 text-center">
                Are you sure you want to {confirmModal.action} this voucher? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4 mt-4 w-full">
              <button
                className={`flex-1 py-3 cursor-pointer rounded-lg font-semibold text-white ${confirmModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} transition-colors duration-200 focus:outline-none`}
                onClick={async () => {
                  if (confirmModal.action === 'approve') {
                    await handleApprove(confirmModal.voucherId);
                  } else {
                    await handleReject(confirmModal.voucherId);
                  }
                  setConfirmModal({ open: false, action: null, voucherId: null });
                }}
              >
                Confirm
              </button>
              <button
                className="flex-1 py-3 cursor-pointer rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none"
                onClick={() => setConfirmModal({ open: false, action: null, voucherId: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PettyCash;