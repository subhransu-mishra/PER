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
  date: "",
  description: "",
  category: "",
  amount: "",
  receiptUrl: "",
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  // User's company data is automatically filtered by the backend based on their organization ID

  // Filter expenses based on search
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.category.toLowerCase().includes(search.toLowerCase()) ||
      expense.status.toLowerCase().includes(search.toLowerCase())
  );

  // Handle add expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.category || !form.amount) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        amount: Number(form.amount),
        description: form.description,
        category: form.category,
        receiptUrl: form.receiptUrl,
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
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
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
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
                onClick={closeModal}
              >
                &times;
              </button>

              <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
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
                    Receipt URL
                  </label>
                  <input
                    type="url"
                    name="receiptUrl"
                    value={form.receiptUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Expense
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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
