import React, { useState, useEffect } from "react";
import { FiEye, FiEdit, FiPlus } from "react-icons/fi";
import { IoAnalyticsSharp } from "react-icons/io5";
import { MdAccountBalanceWallet } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyRevenue = {
  date: "",
  description: "",
  source: "",
  amount: "",
  clientName: "",
  invoiceNumber: "",
  billUrl: "",
  paymentMethod: "bank",
  invoice: null,
};

const Revenue = () => {
  // Confirmation modal state for edit
  const [editConfirmModal, setEditConfirmModal] = useState({
    open: false,
    revenue: null,
  });

  const [search, setSearch] = useState("");
  const [revenues, setRevenues] = useState([]);
  const [form, setForm] = useState(emptyRevenue);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        setRevenues([]);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Revenues response:", res.data);

      if (res.data && Array.isArray(res.data)) {
        setRevenues(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setRevenues(res.data.data);
      } else {
        console.error("Unexpected response format:", res.data);
        setRevenues([]);
      }
    } catch (err) {
      console.error("Error fetching revenues:", err);
      setRevenues([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter revenues based on search and date range
  const filteredRevenues =
    revenues && revenues.length
      ? revenues.filter((revenue) => {
          // First check search text filter
          const matchesSearch =
            revenue.description?.toLowerCase().includes(search.toLowerCase()) ||
            revenue.source?.toLowerCase().includes(search.toLowerCase()) ||
            revenue.clientName?.toLowerCase().includes(search.toLowerCase()) ||
            (revenue.status &&
              revenue.status.toLowerCase().includes(search.toLowerCase()));

          // Then check date range if provided
          let withinDateRange = true;
          if (startDate && endDate) {
            const revenueDate = new Date(revenue.date);
            const filterStart = new Date(startDate);
            const filterEnd = new Date(endDate);
            // Set filterEnd to end of day
            filterEnd.setHours(23, 59, 59, 999);

            withinDateRange =
              revenueDate >= filterStart && revenueDate <= filterEnd;
          } else if (startDate) {
            const revenueDate = new Date(revenue.date);
            const filterStart = new Date(startDate);
            withinDateRange = revenueDate >= filterStart;
          } else if (endDate) {
            const revenueDate = new Date(revenue.date);
            const filterEnd = new Date(endDate);
            // Set filterEnd to end of day
            filterEnd.setHours(23, 59, 59, 999);
            withinDateRange = revenueDate <= filterEnd;
          }

          return matchesSearch && withinDateRange;
        })
      : [];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "invoice" && files && files[0]) {
      setForm((prev) => ({ ...prev, invoice: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchRevenues();
  }, [user]);

  // Add another effect to handle date filter changes
  useEffect(() => {
    // This effect will run when startDate or endDate changes
    // The filtered results are already handled in the filteredRevenues calculation
  }, [startDate, endDate]);

  // User's company data is automatically filtered by the backend based on their organization ID

  // Handle add/edit revenue
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.source || !form.amount) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("amount", Number(form.amount));
      formData.append("description", form.description);
      formData.append("source", form.source);
      formData.append("clientName", form.clientName || "");
      formData.append("invoiceNumber", form.invoiceNumber || "");
      formData.append("date", form.date);
      formData.append("paymentMethod", form.paymentMethod || "bank");

      // Append file if exists
      if (form.invoice) {
        formData.append("invoice", form.invoice);
      }

      let res;

      if (editMode && currentId) {
        // Update existing revenue
        res = await axios.put(
          `${API_BASE_URL}/api/revenue/${currentId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.data && res.data.revenue) {
          setRevenues((prev) =>
            prev.map((item) =>
              item._id === currentId ? res.data.revenue : item
            )
          );
          toast.success("Revenue updated successfully!");
        }
      } else {
        // Create new revenue
        res = await axios.post(
          `${API_BASE_URL}/api/revenue/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.data && res.data.revenue) {
          setRevenues((prev) => [res.data.revenue, ...prev]);
          toast.success("Revenue added successfully!");
        }
      }

      setForm(emptyRevenue);
      setShowModal(false);
      setEditMode(false);
      setCurrentId(null);
      fetchRevenues(); // Refresh the list
    } catch (err) {
      console.error("Error with revenue:", err);
      toast.error(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewRevenue = () => {
    setForm(emptyRevenue);
    setEditMode(false);
    setCurrentId(null);
    setShowModal(true);
  };

  const handleEditRevenue = (revenue) => {
    setForm({
      date: revenue.date
        ? new Date(revenue.date).toISOString().split("T")[0]
        : "",
      description: revenue.description || "",
      source: revenue.source || "",
      amount: revenue.amount || "",
      clientName: revenue.clientName || "",
      invoiceNumber: revenue.invoiceNumber || "",
      paymentMethod: revenue.paymentMethod || "bank",
      invoice: null, // Can't pre-fill file input
    });
    setEditMode(true);
    setCurrentId(revenue._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyRevenue);
    setEditMode(false);
    setCurrentId(null);
  };

  // Calculate total revenue received this month
  const calculateThisMonthRevenue = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return revenues
      .filter((revenue) => {
        const revenueDate = new Date(revenue.date);
        return (
          revenueDate.getMonth() === currentMonth &&
          revenueDate.getFullYear() === currentYear
        );
      })
      .reduce((total, revenue) => total + (Number(revenue.amount) || 0), 0);
  };

  // Calculate total revenue received this week
  const calculateThisWeekRevenue = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    return revenues
      .filter((revenue) => {
        const revenueDate = new Date(revenue.date);
        return revenueDate >= startOfWeek && revenueDate <= now;
      })
      .reduce((total, revenue) => total + (Number(revenue.amount) || 0), 0);
  };

  // Calculate total revenue of all time
  const calculateTotalRevenue = () => {
    return revenues.reduce(
      (total, revenue) => total + (Number(revenue.amount) || 0),
      0
    );
  };

  // Reset date filters
  const resetDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Revenue Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track and manage your company revenue
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* This Month Revenue */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
                <h3 className="text-xl font-bold text-blue-600 mb-1">
                  ₹{calculateThisMonthRevenue().toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500">Revenue received this month</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <IoAnalyticsSharp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* This Week Revenue */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">This Week</p>
                <h3 className="text-xl font-bold text-green-600 mb-1">
                  ₹{calculateThisWeekRevenue().toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500">Revenue received this week</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <MdAccountBalanceWallet className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-xl font-bold text-purple-600 mb-1">
                  ₹{calculateTotalRevenue().toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500">All time revenue</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TbMoneybag className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search revenues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-1 md:col-span-1 flex items-end">
              <button
                onClick={resetDateFilters}
                className="w-full py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-end">
          <button
            className="bg-green-600 cursor-pointer text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 hover:bg-green-700"
            onClick={handleNewRevenue}
          >
            <FiPlus /> Add Revenue
          </button>
        </div>

        {/* Revenues Table Responsive */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRevenues.map((revenue) => (
                    <tr key={revenue._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{revenue.date ? new Date(revenue.date).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{revenue.description || "-"}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600"><span className="capitalize">{revenue.source || "-"}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{revenue.clientName || "-"}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{(revenue.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600"><span className="capitalize">{revenue.paymentMethod || "-"}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button 
                            onClick={() => setEditConfirmModal({ open: true, revenue })} 
                            className="text-blue-600 cursor-pointer hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors duration-200" 
                            title="Edit Revenue"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          {revenue.invoiceUrl && (
                            <a 
                              href={revenue.invoiceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1.5 rounded transition-colors duration-200" 
                              title="View Invoice"
                            >
                              <FiEye className="w-4 h-4" />
                            </a>
                          )}
                          {revenue.invoiceNumber && (
                            <span className="text-blue-600 text-xs">#{revenue.invoiceNumber}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card Layout */}
          <div className="lg:hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-8 w-8 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Loading revenues...</span>
              </div>
            ) : filteredRevenues.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No revenues found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredRevenues.map((revenue) => (
                  <div key={revenue._id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">{revenue.date ? new Date(revenue.date).toLocaleDateString() : "-"}</span>
                          {revenue.invoiceNumber && (
                            <span className="text-blue-600 text-xs ml-2">#{revenue.invoiceNumber}</span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{revenue.description || "-"}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded">{revenue.source || "-"}</span>
                          <span className="capitalize">{revenue.paymentMethod || "-"}</span>
                          {revenue.clientName && <span className="bg-blue-50 px-2 py-1 rounded">{revenue.clientName}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">₹{(revenue.amount || 0).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditConfirmModal({ open: true, revenue })} 
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors duration-200" 
                          title="Edit Revenue"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        {revenue.invoiceUrl && (
                          <a 
                            href={revenue.invoiceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded transition-colors duration-200" 
                            title="View Invoice"
                          >
                            <FiEye className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Revenue Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4">
            <div className="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-200 z-10">
                <button
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
                  onClick={closeModal}
                  disabled={submitting}
                  aria-label="Close"
                  type="button"
                >
                  &times;
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editMode ? "Edit Revenue" : "Add New Revenue"}
                </h3>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 pt-4 space-y-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
                autoComplete="off"
              >
                {/* Date field */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                {/* Client name field */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={form.clientName}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {/* Company name field */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName || ""}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {/* Amount field */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                {/* Payment Method field */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {/* Source field */}
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source *
                  </label>
                  <select
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select source</option>
                    <option value="sales">Sales</option>
                    <option value="services">Services</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Invoice File Upload field */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Invoice/Bill (PDF, JPG, PNG)
                  </label>
                  <input
                    type="file"
                    name="invoice"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  {form.invoice && (
                    <p className="text-sm text-green-600 mt-1">
                      File selected: {form.invoice.name}
                    </p>
                  )}
                </div>
                {/* Description field */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter revenue description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4 sm:col-span-2">
                  <button
                    type="submit"
                    className="flex-1 cursor-pointer rounded-lg py-2 font-semibold bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center"
                    disabled={submitting}
                  >
                    {submitting ? (
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
                            className="opacity-75 "
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing {editMode ? "update" : "submission"}...
                      </>
                    ) : editMode ? (
                      "Update Revenue"
                    ) : (
                      "Add Revenue"
                    )}
                  </button>
                  <button
                    type="button"
                    className="flex-1 cursor-pointer rounded-lg py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      {/* Edit Confirmation Modal */}
      {editConfirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative flex flex-col items-center">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setEditConfirmModal({ open: false, revenue: null })}
                className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="mb-4 flex flex-col items-center">
              <div className="mb-2 text-4xl text-blue-500"><FiEdit /></div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Edit Revenue Entry?
              </h2>
              <p className="text-gray-600 text-center">
                Are you sure you want to edit this revenue entry?
              </p>
            </div>
            <div className="flex gap-4 mt-4 w-full">
              <button
                className="flex-1 py-3 cursor-pointer rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none"
                onClick={() => {
                  handleEditRevenue(editConfirmModal.revenue);
                  setEditConfirmModal({ open: false, revenue: null });
                }}
              >
                Confirm
              </button>
              <button
                className="flex-1 py-3 cursor-pointer rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none"
                onClick={() => setEditConfirmModal({ open: false, revenue: null })}
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

export default Revenue;
              
            