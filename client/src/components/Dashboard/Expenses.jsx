import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
} from "react-icons/fi";
import axios from "axios";

const emptyExpense = {
  serialNumber: "",
  date: "",
  description: "",
  category: "",
  amount: "",
  paymentMethod: "",
  receiptUrl: "",
  billFile: null,
};

const Expenses = () => {
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyExpense);
  const [showModal, setShowModal] = useState(false);
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [serialFilter, setSerialFilter] = useState("");
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [percentChange, setPercentChange] = useState(0);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, billFile: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchExpenses();
  }, [user]);

  // Calculate totals for summary cards
  useEffect(() => {
    if (!expenses.length) {
      setTotalThisMonth(0);
      setPercentChange(0);
      return;
    }
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const totalThis = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalLast = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
    setTotalThisMonth(totalThis);
    if (totalLast === 0) {
      setPercentChange(0);
    } else {
      setPercentChange(((totalThis - totalLast) / totalLast) * 100);
    }
  }, [expenses]);

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

  // Handle add expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.description ||
      !form.category ||
      !form.amount ||
      !form.date ||
      !form.serialNumber ||
      !form.paymentMethod
    ) {
      alert("Please fill in required fields.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      let receiptUrl = form.receiptUrl;
      // Handle file upload if billFile is present
      if (form.billFile) {
        const data = new FormData();
        data.append("file", form.billFile);
        data.append("upload_preset", "per_uploads");
        // You may need to adjust the Cloudinary endpoint or your backend endpoint
        const uploadRes = await axios.post(
          "http://localhost:3000/api/upload", // Adjust as needed
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        receiptUrl = uploadRes.data.url;
      }
      const payload = {
        serialNumber: form.serialNumber,
        amount: Number(form.amount),
        description: form.description,
        category: form.category,
        paymentMethod: form.paymentMethod,
        receiptUrl,
        date: form.date,
      };
      const res = await axios.post(
        "http://localhost:3000/api/expenses",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExpenses((prev) => [res.data.data, ...prev]);
      setForm(emptyExpense);
      setShowModal(false);
      alert("Expense added successfully!");
    } catch (err) {
      console.error("Error adding expense:", err);
      alert(
        "Error adding expense: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Handle approve expense (admin only)
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/expenses/${id}/status`,
        { status: "approved" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExpenses((prev) =>
        prev.map((expense) =>
          expense._id === id ? { ...expense, status: "approved" } : expense
        )
      );
      alert("Expense approved successfully!");
    } catch (err) {
      console.error("Error approving expense:", err);
      alert(
        "Error approving expense: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Handle reject expense (admin only)
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/expenses/${id}/status`,
        { status: "rejected" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExpenses((prev) =>
        prev.map((expense) =>
          expense._id === id ? { ...expense, status: "rejected" } : expense
        )
      );
      alert("Expense rejected successfully!");
    } catch (err) {
      console.error("Error rejecting expense:", err);
      alert(
        "Error rejecting expense: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleNewExpense = () => {
    setForm(emptyExpense);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyExpense);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <div className="text-gray-500 text-sm mb-1">
              Total Expenses This Month
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalThisMonth.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <div className="text-gray-500 text-sm mb-1">
              Change from Last Month
            </div>
            <div
              className={`text-2xl font-bold ${
                percentChange < 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {Math.abs(percentChange).toFixed(2)}%{" "}
              {percentChange < 0 ? "less" : "more"} than last month
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Expense Management
          </h1>
          <p className="text-gray-600">
            Track and manage your company expenses
          </p>
        </div>
        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded"
              placeholder="From date"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded"
              placeholder="To date"
            />
            <input
              type="text"
              value={serialFilter}
              onChange={(e) => setSerialFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded"
              placeholder="Serial Number"
            />
          </div>
          <div className="flex gap-2">
            <button
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
              onClick={handleNewExpense}
            >
              <FiPlus /> Add Expense
            </button>
          </div>
        </div>
        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.serialNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.paymentMethod || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          expense.status
                        )}`}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user?.role === "admin" &&
                        expense.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(expense._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <FiCheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(expense._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <FiXCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      {expense.receiptUrl && (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="View Receipt"
                        >
                          <FiEye className="w-5 h-5" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Add Expense Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
            <div className="bg-white text-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md relative">
              {/* <button
                className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-700 text-xl"
                onClick={closeModal}
              >
                &times;
              </button> */}
              <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Category *
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="travel">Travel</option>
                    <option value="meals">Meals</option>
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="marketing">Marketing</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="salary">Salary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter expense description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium cursor-pointer text-gray-700 mb-1">
                    Upload Bill
                  </label>
                  <input
                    type="file"
                    name="billFile"
                    accept="image/*,application/pdf"
                    onChange={handleChange}
                    className="w-full px-3 py-2 cursor-pointer border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg cursor-pointer py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Expense
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg py-2 cursor-pointer bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={closeModal}
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

export default Expenses;
