import React, { useState } from "react";
import { FiEye, FiEdit, FiTrash2, FiFilter, FiCheckCircle, FiXCircle } from "react-icons/fi";

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
  // Change this to "user" or "admin" for demo/testing
  const [role, setRole] = useState("admin"); // "user" or "admin"
  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(emptyVoucher);
  const [isEditing, setIsEditing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(""); // Only admin can set
  const [balanceSet, setBalanceSet] = useState(false);

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
      // Only allow editing if not approved
      const oldVoucher = vouchers.find((v) => v.id === form.id);
      if (oldVoucher.status === "Approved") {
        alert("Approved vouchers cannot be edited.");
        return;
      }
      setVouchers((prev) =>
        prev.map((v) => (v.id === form.id ? { ...form, amount: amountNum, status: "Pending" } : v))
      );
    } else {
      if (vouchers.some((v) => v.id === form.id)) {
        alert("Voucher ID must be unique.");
        return;
      }
      // For normal users, always set status to Pending
      const status = role === "admin" ? form.status : "Pending";
      setVouchers((prev) => [
        ...prev,
        { ...form, amount: amountNum, status }
      ]);
    }
    setForm(emptyVoucher);
    setIsEditing(false);
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

  // Start new voucher
  const handleNewVoucher = () => {
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* DEMO: Role Switcher */}
      <div className="mb-2">
        <span className="mr-2 font-semibold">Role:</span>
        <button
          className={`px-3 py-1 rounded-l ${role === "user" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setRole("user")}
        >
          User
        </button>
        <button
          className={`px-3 py-1 rounded-r ${role === "admin" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setRole("admin")}
        >
          Admin
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Petty Cash</h1>
        <p className="text-gray-600 text-sm">
          Manage your petty cash allocations and vouchers
        </p>
      </div>

      {/* Set Total Balance (admin only) */}
      {!balanceSet && role === "admin" && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <form className="flex gap-4 items-center" onSubmit={handleSetBalance}>
            <input
              type="number"
              placeholder="Enter total petty cash balance"
              className="border rounded px-2 py-1"
              value={totalBalance}
              onChange={(e) => setTotalBalance(e.target.value)}
              min={0}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2"
            >
              Set Balance
            </button>
          </form>
        </div>
      )}

      {/* Info for users if balance not set */}
      {!balanceSet && role === "user" && (
        <div className="bg-yellow-100 text-yellow-800 rounded p-4 mb-4">
          The petty cash balance has not been set by the admin yet. Please contact your admin.
        </div>
      )}

      {/* Add/Edit Voucher Form */}
      {balanceSet && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
            <input
              name="id"
              type="text"
              placeholder="Voucher No."
              className="border rounded px-2 py-1"
              value={form.id}
              onChange={handleChange}
              disabled={isEditing}
            />
            <input
              name="date"
              type="date"
              className="border rounded px-2 py-1"
              value={form.date}
              onChange={handleChange}
            />
            <input
              name="description"
              type="text"
              placeholder="Description"
              className="border rounded px-2 py-1"
              value={form.description}
              onChange={handleChange}
            />
            <input
              name="category"
              type="text"
              placeholder="Category"
              className="border rounded px-2 py-1"
              value={form.category}
              onChange={handleChange}
            />
            <input
              name="amount"
              type="number"
              placeholder="Amount"
              className="border rounded px-2 py-1"
              value={form.amount}
              onChange={handleChange}
              min={1}
              max={totalBalance}
              disabled={role === "user"} // User cannot set amount
            />
            <input
              name="requestedBy"
              type="text"
              placeholder="Requested By"
              className="border rounded px-2 py-1"
              value={form.requestedBy}
              onChange={handleChange}
            />
            {/* Only admin can set status on creation, user always requests */}
            {role === "admin" && (
              <select
                name="status"
                className="border rounded px-2 py-1"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2 col-span-1 md:col-span-2"
            >
              {isEditing ? "Update Request" : role === "admin" ? "Add Voucher" : "Request Voucher"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="bg-gray-300 text-gray-800 rounded px-4 py-2"
                onClick={handleNewVoucher}
              >
                Cancel
              </button>
            )}
            {role === "admin" && (
              <button
                type="button"
                className="bg-red-500 text-white rounded px-4 py-2"
                onClick={handleResetBalance}
              >
                Reset Balance
              </button>
            )}
          </form>
        </div>
      )}

      {/* Top Summary Cards */}
      {balanceSet && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-lg font-semibold text-gray-600">Total Balance</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              ₹{totalBalance}
            </h2>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-lg font-semibold text-gray-600">This Month</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              ₹{vouchers
                .filter((v) => new Date(v.date).getMonth() === new Date().getMonth() && v.status === "Approved")
                .reduce((sum, v) => sum + Number(v.amount), 0)}
            </h2>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-lg font-semibold text-gray-600">Pending Requests</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              {vouchers.filter((v) => v.status === "Pending").length}
            </h2>
          </div>
        </div>
      )}

      {/* Search + Buttons */}
      {balanceSet && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-1 items-center w-full sm:max-w-md bg-white rounded-md border border-gray-300 px-3 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Search vouchers, descriptions, or requestor..."
              className="w-full outline-none text-sm text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 text-gray-800 text-sm"
              onClick={() => alert("Advanced filter not implemented")}
            >
              <FiFilter className="w-4 h-4" />
              Advanced
            </button>
            <button
              className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 text-sm font-medium"
              onClick={handleExport}
            >
              Export
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm"
              onClick={handleNewVoucher}
            >
              {role === "admin" ? "+ New Voucher" : "+ Request Voucher"}
            </button>
          </div>
        </div>
      )}

      {/* Voucher Table */}
      {balanceSet && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Voucher No.</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Requested By</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
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
                  <tr key={voucher.id} className="border-t text-gray-700">
                    <td className="px-6 py-4 font-medium">{voucher.id}</td>
                    <td className="px-6 py-4">{voucher.date}</td>
                    <td className="px-6 py-4">{voucher.description}</td>
                    <td className="px-6 py-4">{voucher.category}</td>
                    <td className="px-6 py-4">₹{voucher.amount}</td>
                    <td className="px-6 py-4">{voucher.requestedBy}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          voucher.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : voucher.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <FiEye
                        className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-600"
                        onClick={() => handleView(voucher.id)}
                      />
                      {/* Only admin can approve/reject or delete */}
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
                      {/* Only allow edit/delete if not approved */}
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
