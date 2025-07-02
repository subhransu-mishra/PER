import React, { useState } from "react";
import { FiEye, FiEdit, FiTrash2, FiFilter, FiCheckCircle, FiXCircle, FiPlus } from "react-icons/fi";

const emptyVoucher = {
  id: "",
  date: "",
  description: "",
  category: "",
  amount: "",
  requestedBy: "",
  status: "Pending",
};

const PettyCash = () => {
  const [role, setRole] = useState("admin"); // "user" or "admin"
  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(emptyVoucher);
  const [isEditing, setIsEditing] = useState(false);
  const [totalBalance, setTotalBalance] = useState("");
  const [balanceSet, setBalanceSet] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Filter vouchers based on search
  const filteredVouchers = vouchers.filter(
    (v) =>
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.requestedBy.toLowerCase().includes(search.toLowerCase())
  );

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle add or edit submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.id ||
      !form.date ||
      !form.description ||
      !form.category ||
      !form.amount ||
      !form.requestedBy
    ) {
      alert("Please fill all fields.");
      return;
    }
    const amountNum = Number(form.amount);

    if (isEditing) {
      const oldVoucher = vouchers.find((v) => v.id === form.id);
      if (oldVoucher.status === "Approved") {
        alert("Approved vouchers cannot be edited.");
        return;
      }
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === form.id
            ? { ...form, amount: amountNum }
            : v
        )
      );
    } else {
      if (vouchers.some((v) => v.id === form.id)) {
        alert("Voucher ID must be unique.");
        return;
      }
      const status = role === "admin" ? form.status : "Pending";
      setVouchers((prev) => [
        ...prev,
        { ...form, amount: amountNum, status }
      ]);
    }
    setForm(emptyVoucher);
    setIsEditing(false);
    setShowModal(false);
  };

  // Handle edit
  const handleEdit = (id) => {
    const voucher = vouchers.find((v) => v.id === id);
    if (voucher.status === "Approved") {
      alert("Approved vouchers cannot be edited.");
      return;
    }
    setForm(voucher);
    setIsEditing(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    const voucher = vouchers.find((v) => v.id === id);
    if (voucher.status === "Approved") {
      alert("Approved vouchers cannot be deleted.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this voucher?")) {
      setVouchers((prev) => prev.filter((v) => v.id !== id));
      if (isEditing && form.id === id) {
        setForm(emptyVoucher);
        setIsEditing(false);
      }
    }
  };

  // Handle view (simple alert for now)
  const handleView = (id) => {
    const voucher = vouchers.find((v) => v.id === id);
    alert(JSON.stringify(voucher, null, 2));
  };

  // Admin: Approve voucher
  const handleApprove = (id) => {
    const voucher = vouchers.find((v) => v.id === id);
    if (voucher.status !== "Pending") return;
    if (Number(voucher.amount) > Number(totalBalance)) {
      alert("Not enough balance to approve this voucher.");
      return;
    }
    setVouchers((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "Approved" } : v
      )
    );
    setTotalBalance((prev) => String(Number(prev) - Number(voucher.amount)));
  };

  // Admin: Reject voucher
  const handleReject = (id) => {
    setVouchers((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "Rejected" } : v
      )
    );
  };

  // Export handler (not implemented)
  const handleExport = () => {
    alert("Export functionality not implemented yet.");
  };

  // Open modal for user request
  const handleNewVoucher = () => {
    setForm(emptyVoucher);
    setIsEditing(false);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setForm(emptyVoucher);
    setIsEditing(false);
  };

  // Handle setting the initial balance (admin only)
  const handleSetBalance = (e) => {
    e.preventDefault();
    if (!totalBalance || isNaN(Number(totalBalance)) || Number(totalBalance) < 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setBalanceSet(true);
  };

  // Optionally allow resetting the balance (admin only)
  const handleResetBalance = () => {
    setBalanceSet(false);
    setTotalBalance("");
    setVouchers([]);
    setForm(emptyVoucher);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 bg-white">
      {/* DEMO: Role Switcher */}
      <div className="mb-2 flex flex-wrap justify-end p-2 sm:p-4">
        <span className="mr-2 font-semibold">Role:</span>
        <button
          className={`px-3 py-1 rounded-l ${role === "user" ? "bg-gray-300" : ""}`}
          onClick={() => setRole("user")}
        >
          User
        </button>
        <button
          className={`px-3 py-1 rounded-r ${role === "admin" ? "bg-gray-300" : ""}`}
          onClick={() => setRole("admin")}
        >
          Admin
        </button>
      </div>

      {/* Header */}
      <div className="mb-4 md:mb-6 py-2 md:py-4 px-2 md:px-4 border-b">
        <h1 className="text-2xl md:text-3xl font-bold">Petty Cash</h1>
        <p className="text-gray-600 text-base md:text-lg mt-2">
          Manage your petty cash allocations and vouchers
        </p>
      </div>

      {/* Set Total Balance (admin only) */}
      {!balanceSet && role === "admin" && (
        <div className="bg-white border rounded-lg p-4 md:p-6 max-w-xl mx-auto mb-4 md:mb-6">
          <form className="flex flex-col md:flex-row gap-2 md:gap-4 items-center" onSubmit={handleSetBalance}>
            <input
              type="number"
              placeholder="Enter total petty cash balance"
              className="border rounded px-2 py-2 flex-1"
              value={totalBalance}
              onChange={(e) => setTotalBalance(e.target.value)}
              min={0}
            />
            <button
              type="submit"
              className="bg-gray-800 text-white rounded px-4 md:px-6 py-2 font-semibold"
            >
              Set Balance
            </button>
          </form>
        </div>
      )}

      {/* Info for users if balance not set */}
      {!balanceSet && role === "user" && (
        <div className="bg-yellow-100 text-yellow-800 rounded p-4 mb-4 max-w-xl mx-auto border">
          The petty cash balance has not been set by the admin yet. Please contact your admin.
        </div>
      )}

      {/* Top Summary Cards */}
      {balanceSet && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto mb-4 md:mb-6">
          <div className="bg-white border rounded-lg p-4 md:p-6">
            <p className="text-base md:text-lg font-semibold text-gray-600">Total Balance</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-2">
              ₹{totalBalance}
            </h2>
          </div>
          <div className="bg-white border rounded-lg p-4 md:p-6">
            <p className="text-base md:text-lg font-semibold text-gray-600">This Month</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-2">
              ₹{vouchers
                .filter((v) => new Date(v.date).getMonth() === new Date().getMonth() && v.status === "Approved")
                .reduce((sum, v) => sum + Number(v.amount), 0)}
            </h2>
          </div>
          <div className="bg-white border rounded-lg p-4 md:p-6">
            <p className="text-base md:text-lg font-semibold text-gray-600">Pending Requests</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-2">
              {vouchers.filter((v) => v.status === "Pending").length}
            </h2>
          </div>
        </div>
      )}

      {/* Search + Buttons */}
      {balanceSet && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 max-w-6xl mx-auto mb-4 md:mb-6">
          <div className="flex flex-1 items-center w-full sm:max-w-md bg-white rounded-md border border-gray-300 px-2 md:px-3 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Search vouchers, descriptions, or requestor..."
              className="w-full outline-none text-sm text-gray-700 bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 md:gap-3">
            <button
              className="flex items-center gap-2 px-3 md:px-4 py-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 text-gray-800 text-sm"
              onClick={() => alert("Advanced filter not implemented")}
            >
              <FiFilter className="w-4 h-4" />
              Advanced
            </button>
            <button
              className="px-3 md:px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 text-sm font-medium"
              onClick={handleExport}
            >
              Export
            </button>
            {role === "user" && (
              <button
                className="bg-gray-800 text-white px-3 md:px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                onClick={handleNewVoucher}
              >
                <FiPlus /> Request Voucher
              </button>
            )}
            {role === "admin" && (
              <button
                className="bg-gray-800 text-white px-3 md:px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                onClick={handleNewVoucher}
              >
                <FiPlus /> New Voucher
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Form for user only */}
      {showModal && role === "user" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30"
          style={{ overflow: "hidden" }}
        >
          <div className="bg-white text-gray-900 rounded-2xl shadow-lg p-4 md:p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-1">Request Voucher</h2>
            <p className="mb-6 text-gray-600 text-sm">
              Enter the details for your new petty cash request.
            </p>
            <form
              onSubmit={(e) => {
                handleSubmit(e);
                if (
                  form.id &&
                  form.date &&
                  form.description &&
                  form.category &&
                  form.amount &&
                  form.requestedBy
                ) {
                  setShowModal(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-sm">Voucher No.</label>
                  <input
                    name="id"
                    type="text"
                    placeholder="Voucher No."
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.id}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Date</label>
                  <input
                    name="date"
                    type="date"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm">Description</label>
                  <input
                    name="description"
                    type="text"
                    placeholder="e.g., Office supplies"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Category</label>
                  <input
                    name="category"
                    type="text"
                    placeholder="e.g., Office, Refreshments"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.category}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Amount (₹)</label>
                  <input
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.amount}
                    onChange={handleChange}
                    min={1}
                    max={totalBalance}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm">Requested By</label>
                  <input
                    name="requestedBy"
                    type="text"
                    placeholder="Your Name"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.requestedBy}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 rounded-lg py-2 font-semibold bg-gray-800 text-white hover:bg-gray-900"
                >
                  Request Voucher
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

      {/* Modal Form for admin */}
      {showModal && role === "admin" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30"
          style={{ overflow: "hidden" }}
        >
          <div className="bg-white text-gray-900 rounded-2xl shadow-lg p-4 md:p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-1">{isEditing ? "Update Voucher" : "Add Voucher"}</h2>
            <p className="mb-6 text-gray-600 text-sm">
              Enter the details for your new petty cash voucher.
            </p>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-sm">Voucher No.</label>
                  <input
                    name="id"
                    type="text"
                    placeholder="Voucher No."
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.id}
                    onChange={handleChange}
                    autoFocus
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Date</label>
                  <input
                    name="date"
                    type="date"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm">Description</label>
                  <input
                    name="description"
                    type="text"
                    placeholder="e.g., Office supplies"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Category</label>
                  <input
                    name="category"
                    type="text"
                    placeholder="e.g., Office, Refreshments"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.category}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Amount (₹)</label>
                  <input
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.amount}
                    onChange={handleChange}
                    min={1}
                    max={totalBalance}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm">Requested By</label>
                  <input
                    name="requestedBy"
                    type="text"
                    placeholder="Requested By"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={form.requestedBy}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm">Status</label>
                  <select
                    name="status"
                    className="w-full rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 rounded-lg py-2 font-semibold bg-gray-800 text-white hover:bg-gray-900"
                >
                  {isEditing ? "Update Request" : "Add Voucher"}
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

      {/* Voucher Table */}
      {balanceSet && (
        <div className="bg-white border rounded-lg overflow-x-auto max-w-full md:max-w-6xl mx-auto">
          <table className="w-full text-xs md:text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-2 md:px-6 py-3">Voucher No.</th>
                <th className="px-2 md:px-6 py-3">Date</th>
                <th className="px-2 md:px-6 py-3">Description</th>
                <th className="px-2 md:px-6 py-3">Category</th>
                <th className="px-2 md:px-6 py-3">Amount</th>
                <th className="px-2 md:px-6 py-3">Requested By</th>
                <th className="px-2 md:px-6 py-3">Status</th>
                <th className="px-2 md:px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No vouchers found.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-t text-gray-700 hover:bg-gray-100 transition">
                    <td className="px-2 md:px-6 py-4 font-medium break-all">{voucher.id}</td>
                    <td className="px-2 md:px-6 py-4">{voucher.date}</td>
                    <td className="px-2 md:px-6 py-4 break-all">{voucher.description}</td>
                    <td className="px-2 md:px-6 py-4">{voucher.category}</td>
                    <td className="px-2 md:px-6 py-4">₹{voucher.amount}</td>
                    <td className="px-2 md:px-6 py-4">{voucher.requestedBy}</td>
                    <td className="px-2 md:px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border`}
                        style={{
                          background:
                            voucher.status === "Approved"
                              ? "#e6ffe6"
                              : voucher.status === "Pending"
                              ? "#fffbe6"
                              : "#ffe6e6",
                          color:
                            voucher.status === "Approved"
                              ? "#166534"
                              : voucher.status === "Pending"
                              ? "#92400e"
                              : "#991b1b",
                          borderColor:
                            voucher.status === "Approved"
                              ? "#22c55e"
                              : voucher.status === "Pending"
                              ? "#facc15"
                              : "#ef4444",
                        }}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-2 md:px-6 py-4 flex gap-2 md:gap-3">
                      <FiEye
                        className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-600"
                        onClick={() => handleView(voucher.id)}
                      />
                      {role === "admin" && voucher.status === "Pending" && (
                        <>
                          <FiCheckCircle
                            title="Approve"
                            className="w-5 h-5 cursor-pointer text-green-600 hover:text-green-800"
                            onClick={() => handleApprove(voucher.id)}
                          />
                          <FiXCircle
                            title="Reject"
                            className="w-5 h-5 cursor-pointer text-red-600 hover:text-red-800"
                            onClick={() => handleReject(voucher.id)}
                          />
                        </>
                      )}
                      {voucher.status !== "Approved" && (
                        <>
                          <FiEdit
                            className="w-5 h-5 cursor-pointer text-gray-600 hover:text-yellow-500"
                            onClick={() => handleEdit(voucher.id)}
                          />
                          <FiTrash2
                            className="w-5 h-5 cursor-pointer text-gray-600 hover:text-red-600"
                            onClick={() => handleDelete(voucher.id)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PettyCash;