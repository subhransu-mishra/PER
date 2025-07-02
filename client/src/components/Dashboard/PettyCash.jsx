import React from "react";
import { FiEye, FiEdit, FiTrash2, FiFilter } from "react-icons/fi";
const PettyCash = () => {
  const vouchers = [
    {
      id: "PC-001",
      date: "2024-06-15",
      description: "Office supplies purchase",
      category: "Office Supplies",
      amount: 1250,
      requestedBy: "John Doe",
      status: "Approved",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Petty Cash</h1>
        <p className="text-gray-600 text-sm">
          Manage your petty cash allocations and vouchers
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg font-semibold text-gray-600">Total Balance</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">₹12,450</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg font-semibold text-gray-600">This Month</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">₹8,340</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg font-semibold text-gray-600">Pending Vouchers</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">3</h2>
        </div>
      </div>

      {/* Search + Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-1 items-center w-full sm:max-w-md bg-white rounded-md border border-gray-300 px-3 py-2 shadow-sm">
          <input
            type="text"
            placeholder="Search vouchers, descriptions, or requestor..."
            className="w-full outline-none text-sm text-gray-700"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 text-gray-800 text-sm">
            <FiFilter className="w-4 h-4" />
            Advanced
          </button>
          <button className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 text-sm font-medium">
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm">
            + New Voucher
          </button>
        </div>
      </div>

      {/* Voucher Table */}
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
            {vouchers.map((voucher) => (
              <tr key={voucher.id} className="border-t text-gray-700">
                <td className="px-6 py-4 font-medium">{voucher.id}</td>
                <td className="px-6 py-4">{voucher.date}</td>
                <td className="px-6 py-4">{voucher.description}</td>
                <td className="px-6 py-4">{voucher.category}</td>
                <td className="px-6 py-4">₹{voucher.amount}</td>
                <td className="px-6 py-4">{voucher.requestedBy}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {voucher.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <FiEye className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-600" />
                  <FiEdit className="w-5 h-5 cursor-pointer text-gray-600 hover:text-yellow-500" />
                  <FiTrash2 className="w-5 h-5 cursor-pointer text-gray-600 hover:text-red-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PettyCash;
