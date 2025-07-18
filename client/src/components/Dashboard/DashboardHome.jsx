import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiDollarSign,
  FiPieChart,
  FiCreditCard,
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
} from "react-icons/fi";
import { format } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    expenses: {
      currentMonthTotal: 0,
      percentageChange: 0,
      pendingCount: 0,
    },
    revenue: {
      currentMonthTotal: 0,
      percentageChange: 0,
    },
    pettyCash: {
      balance: 0,
      pendingTransactions: 0,
      currentMonthTotal: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Get expense stats
      const expenseRes = await axios.get(`${API_BASE_URL}/api/expense/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get revenue stats
      const revenueRes = await axios
        .get(`${API_BASE_URL}/api/revenue/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => {
          console.log("Revenue stats not available:", err);
          return { data: { success: false } };
        });

      // Get petty cash stats
      const pettyCashRes = await axios
        .get(`${API_BASE_URL}/api/pettycash/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => {
          console.log("Petty cash stats not available:", err);
          return { data: { success: false } };
        });

      // Get recent transactions (combined from all sources)
      const recentTxRes = await axios
        .get(`${API_BASE_URL}/api/expense?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => {
          console.log("Recent transactions not available:", err);
          return { data: { success: false, data: [] } };
        });

      // Update state with fetched data
      setStats({
        expenses: {
          currentMonthTotal: expenseRes.data.success
            ? expenseRes.data.data.currentMonthTotal || 0
            : 0,
          percentageChange: expenseRes.data.success
            ? expenseRes.data.data.percentageChange || 0
            : 0,
          pendingCount: expenseRes.data.success
            ? expenseRes.data.data.pendingCount || 0
            : 0,
        },
        revenue: {
          currentMonthTotal: revenueRes.data.success
            ? revenueRes.data.data?.currentMonthTotal || 0
            : 0,
          percentageChange: revenueRes.data.success
            ? revenueRes.data.data?.percentageChange || 0
            : 0,
        },
        pettyCash: {
          balance: pettyCashRes.data.success
            ? pettyCashRes.data.stats?.totalAmount || 0
            : 0,
          pendingTransactions: pettyCashRes.data.success
            ? pettyCashRes.data.stats?.pendingCount || 0
            : 0,
          currentMonthTotal: pettyCashRes.data.success
            ? pettyCashRes.data.stats?.totalAmount || 0
            : 0,
        },
      });

      if (recentTxRes.data.success) {
        setRecentTransactions(recentTxRes.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 transition-all duration-300 ease-in-out">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 sm:p-6 mb-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
         Hello {user?.name || "User"}!
        </h1>
        <p className="opacity-90 text-sm sm:text-base">
          Here's an overview of your business finances for{" "}
          {format(new Date(), "MMMM yyyy")}
        </p>
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm opacity-80">
          Last updated: {format(new Date(), "MMM dd, yyyy, hh:mm a")}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Link
          to="/dashboard/revenue"
          className="bg-white p-3 sm:p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="bg-green-100 rounded-full p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
              <FiDollarSign className="text-green-600 text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                Add Revenue
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                Record new income
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/expenses"
          className="bg-white p-3 sm:p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="bg-blue-100 rounded-full p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
              <FiCreditCard className="text-blue-600 text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                Add Expense
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                Record new expenses
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/petty-cash"
          className="bg-white p-3 sm:p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="bg-yellow-100 rounded-full p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
              <FiDollarSign className="text-yellow-600 text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Petty Cash</h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                Manage small expenses
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/reports"
          className="bg-white p-3 sm:p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="bg-purple-100 rounded-full p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
              <FiPieChart className="text-purple-600 text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Reports</h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                View financial reports
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Revenue Card */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 text-sm">Revenue This Month</h3>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                ) : (
                  `₹${(stats.revenue.currentMonthTotal || 0).toLocaleString()}`
                )}
              </div>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <FiArrowDown className="text-green-600" />
            </div>
          </div>
          <div className="flex flex-wrap justify-between text-sm">
            <div
              className={`${
                stats.revenue.percentageChange > 0
                  ? "text-green-600"
                  : "text-red-600"
              } mb-2 sm:mb-0`}
            >
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-5 w-20 rounded"></div>
              ) : (
                `${Math.abs(stats.revenue.percentageChange).toFixed(1)}% ${
                  stats.revenue.percentageChange > 0 ? "more" : "less"
                } than last month`
              )}
            </div>
            <div className="text-gray-500">
              <Link
                to="/dashboard/revenue"
                className="text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 text-sm">Expenses This Month</h3>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                ) : (
                  `₹${(stats.expenses.currentMonthTotal || 0).toLocaleString()}`
                )}
              </div>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <FiArrowUp className="text-red-600" />
            </div>
          </div>
          <div className="flex flex-wrap justify-between text-sm">
            <div
              className={`${
                stats.expenses.percentageChange < 0
                  ? "text-green-600"
                  : "text-red-600"
              } mb-2 sm:mb-0`}
            >
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-5 w-20 rounded"></div>
              ) : (
                `${Math.abs(stats.expenses.percentageChange).toFixed(1)}% ${
                  stats.expenses.percentageChange < 0 ? "less" : "more"
                } than last month`
              )}
            </div>
            <div className="text-gray-500">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-5 w-16 rounded"></div>
              ) : (
                `${stats.expenses.pendingCount} pending`
              )}
            </div>
          </div>
        </div>

        {/* Petty Cash Card */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 text-sm">
                Petty Cash Spent This Month
              </h3>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                ) : (
                  `₹${(
                    stats.pettyCash.currentMonthTotal ||
                    stats.pettyCash.balance ||
                    0
                  ).toLocaleString()}`
                )}
              </div>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full">
              <FiDollarSign className="text-yellow-600" />
            </div>
          </div>
          <div className="flex flex-wrap justify-between text-sm">
            <div className="text-gray-600 mb-2 sm:mb-0">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-5 w-20 rounded"></div>
              ) : (
                `${stats.pettyCash.pendingTransactions} pending transactions`
              )}
            </div>
            <div className="text-gray-500">
              <Link
                to="/dashboard/petty-cash"
                className="text-blue-600 hover:underline"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold">
              Recent Transactions
            </h3>
            <Link
              to="/dashboard/expenses"
              className="text-blue-600 hover:underline text-xs sm:text-sm"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 sm:p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="bg-gray-200 h-8 sm:h-10 w-8 sm:w-10 rounded-full mr-3 sm:mr-4"></div>
                    <div className="flex-1">
                      <div className="bg-gray-200 h-3 sm:h-4 w-full rounded mb-1 sm:mb-2"></div>
                      <div className="bg-gray-200 h-2 sm:h-3 w-4/5 rounded"></div>
                    </div>
                    <div className="bg-gray-200 h-5 sm:h-6 w-16 sm:w-20 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-6 sm:p-10 text-center text-gray-500">
              No recent transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Category
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {tx.date
                          ? format(new Date(tx.date), "dd MMM yyyy")
                          : "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-[120px] sm:max-w-none truncate">
                        {tx.description || "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {tx.category || "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-right font-medium text-gray-900">
                        ₹{(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs text-right hidden sm:table-cell">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                            ${
                              tx.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : tx.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {tx.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Calendar & Upcoming Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center">
            <FiCalendar className="text-blue-500 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold">
              Financial Calendar
            </h3>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-gray-500 mb-4 text-sm">
            Important upcoming financial events and deadlines:
          </p>
          <div className="space-y-4">
            {/* These would typically come from an API but hardcoded for now */}
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1 flex-shrink-0">
                <div className="text-xs text-blue-800 font-bold">
                  {format(new Date(), "dd")}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm sm:text-base">
                  Monthly Financial Review
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  Review your monthly financial statements and reconcile
                  accounts
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-3 mt-1 flex-shrink-0">
                <div className="text-xs text-red-800 font-bold">
                  {format(
                    new Date(new Date().setDate(new Date().getDate() + 7)),
                    "dd"
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm sm:text-base">
                  Tax Filing Deadline
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  Deadline for filing your quarterly tax returns
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3 mt-1 flex-shrink-0">
                <div className="text-xs text-green-800 font-bold">
                  {format(
                    new Date(new Date().setDate(new Date().getDate() + 14)),
                    "dd"
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm sm:text-base">
                  Vendor Payment Due
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  Monthly vendor payments and subscription renewals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
