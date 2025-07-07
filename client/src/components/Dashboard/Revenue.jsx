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

const emptyRevenue = {
  date: "",
  description: "",
  source: "",
  amount: "",
  clientName: "",
  invoiceNumber: "",
};

const Revenue = () => {
  const [search, setSearch] = useState("");
  const [revenues, setRevenues] = useState([]);
  const [form, setForm] = useState(emptyRevenue);
  const [showModal, setShowModal] = useState(false);
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const fetchRevenues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/revenues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevenues(res.data.data);
    } catch (err) {
      console.error("Error fetching revenues:", err);
      setRevenues([]);
    }
  };

  // Filter revenues based on search
  const filteredRevenues = revenues.filter(
    (revenue) =>
      revenue.description.toLowerCase().includes(search.toLowerCase()) ||
      revenue.source.toLowerCase().includes(search.toLowerCase()) ||
      revenue.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      revenue.status.toLowerCase().includes(search.toLowerCase())
  );

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!user) return;
    fetchRevenues();
  }, [user]);

  // User's company data is automatically filtered by the backend based on their organization ID

  // Handle add revenue
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.source || !form.amount) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        amount: Number(form.amount),
        description: form.description,
        source: form.source,
        clientName: form.clientName,
        invoiceNumber: form.invoiceNumber,
        date: form.date,
      };

      const res = await axios.post(
        "http://localhost:3000/api/revenues",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRevenues((prev) => [res.data.data, ...prev]);
      setForm(emptyRevenue);
      setShowModal(false);
      alert("Revenue added successfully!");
    } catch (err) {
      console.error("Error adding revenue:", err);
      alert(
        "Error adding revenue: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Handle mark as received
  const handleMarkReceived = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/revenues/${id}/status`,
        { status: "received" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRevenues((prev) =>
        prev.map((revenue) =>
          revenue._id === id ? { ...revenue, status: "received" } : revenue
        )
      );
      alert("Revenue marked as received!");
    } catch (err) {
      console.error("Error marking revenue as received:", err);
      alert(
        "Error marking revenue as received: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Handle mark as overdue
  const handleMarkOverdue = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/revenues/${id}/status`,
        { status: "overdue" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRevenues((prev) =>
        prev.map((revenue) =>
          revenue._id === id ? { ...revenue, status: "overdue" } : revenue
        )
      );
      alert("Revenue marked as overdue!");
    } catch (err) {
      console.error("Error marking revenue as overdue:", err);
      alert(
        "Error marking revenue as overdue: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleNewRevenue = () => {
    setForm(emptyRevenue);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyRevenue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "received":
        return "text-green-600 bg-green-100";
      case "overdue":
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
            Revenue Management
          </h1>
          <p className="text-gray-600">Track and manage your company revenue</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search revenues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-green-700"
              onClick={handleNewRevenue}
            >
              <FiPlus /> Add Revenue
            </button>
          </div>
        </div>

        {/* Revenues Table */}
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
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
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
                {filteredRevenues.map((revenue) => (
                  <tr key={revenue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(revenue.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {revenue.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {revenue.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {revenue.clientName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{revenue.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          revenue.status
                        )}`}
                      >
                        {revenue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {revenue.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleMarkReceived(revenue._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Received"
                          >
                            <FiCheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleMarkOverdue(revenue._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Mark as Overdue"
                          >
                            <FiXCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {revenue.invoiceNumber && (
                        <span className="text-blue-600 text-xs">
                          #{revenue.invoiceNumber}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Revenue Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
            <div className="bg-white text-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
                onClick={closeModal}
              >
                &times;
              </button>

              <h3 className="text-lg font-semibold mb-4">Add New Revenue</h3>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                    placeholder="Enter revenue description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={form.invoiceNumber}
                    onChange={handleChange}
                    placeholder="Enter invoice number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg py-2 font-semibold bg-green-600 text-white hover:bg-green-700"
                  >
                    Add Revenue
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

export default Revenue;
