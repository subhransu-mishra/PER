import React, { useState, useEffect } from "react";
import RevenueChart from "./Charts/RevenueChart";
import ExpenseChart from "./Charts/ExpenseChart";
import PettyCashChart from "./Charts/PettyCashChart";
import CashflowChart from "./Charts/CashflowChart";
import { PiBankBold } from "react-icons/pi";
import { GiPayMoney } from "react-icons/gi";
import { TbMoneybag } from "react-icons/tb";
import { MdAccountBalanceWallet } from "react-icons/md";
import { VscRefresh } from "react-icons/vsc";
import { IoAnalyticsSharp } from "react-icons/io5";



const Reports = () => {
  const [reportData, setReportData] = useState({
    revenue: null,
    expenses: null,
    pettyCash: null,
    cashflow: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const token = localStorage.getItem("token");

      console.log("Fetching report data...");
      console.log("Token exists:", !!token);

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all report data in parallel with proper API URL
      const [revenueRes, expensesRes, pettyCashRes, cashflowRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/reports/revenue-summary`, { headers }),
          fetch(`${API_BASE_URL}/api/reports/expenses-summary`, { headers }),
          fetch(`${API_BASE_URL}/api/reports/pettycash-summary`, { headers }),
          fetch(`${API_BASE_URL}/api/reports/cashflow-summary`, { headers }),
        ]);

      // Process responses individually - don't fail all if one fails
      let revenueData = null;
      let expensesData = null;
      let pettyCashData = null;
      let cashflowData = null;

      // Handle revenue response
      if (revenueRes.ok) {
        revenueData = await revenueRes.json();
      } else {
        console.error("Revenue API error:", revenueRes.status, await revenueRes.text());
      }

      // Handle expenses response
      if (expensesRes.ok) {
        expensesData = await expensesRes.json();
      } else {
        console.error("Expenses API error:", expensesRes.status, await expensesRes.text());
      }

      // Handle petty cash response
      if (pettyCashRes.ok) {
        pettyCashData = await pettyCashRes.json();
      } else {
        console.error("PettyCash API error:", pettyCashRes.status, await pettyCashRes.text());
      }

      // Handle cashflow response
      if (cashflowRes.ok) {
        cashflowData = await cashflowRes.json();
      } else {
        console.error("Cashflow API error:", cashflowRes.status, await cashflowRes.text());
      }

      // Data is already processed above

      console.log("Revenue Data:", revenueData);
      console.log("Revenue sourceBreakdown:", revenueData?.sourceBreakdown);
      console.log("Revenue monthlyTrend:", revenueData?.monthlyTrend);
      console.log("Revenue statusBreakdown:", revenueData?.statusBreakdown);
      console.log("Revenue paymentMethodBreakdown:", revenueData?.paymentMethodBreakdown);

      setReportData({
        revenue: revenueData,
        expenses: expensesData,
        pettyCash: pettyCashData,
        cashflow: cashflowData,
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading reports</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={fetchReportData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <IoAnalyticsSharp className="w-8 h-8 text-green-600" /> Reports Dashboard
        </h1>
        <button
          onClick={fetchReportData}
          className="px-4 py-2 flex justify-center gap-2 cursor-pointer items-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh Data <VscRefresh /> 
        </button>
        
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  reportData.revenue?.totalSummary?.totalAmount || 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reportData.revenue?.totalSummary?.totalCount || 0} transactions
              </p>
            </div>
            <div className="text-3xl">
              <PiBankBold />
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  reportData.expenses?.totalSummary?.totalAmount || 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reportData.expenses?.totalSummary?.totalCount || 0}{" "}
                transactions
              </p>
            </div>
            <div className="text-3xl">
              <GiPayMoney />{" "}
            </div>
          </div>
        </div>

        {/* Petty Cash Used Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Petty Cash Used
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(
                  reportData.pettyCash?.summary?.totalAmount || 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reportData.pettyCash?.summary?.total || 0} transactions
              </p>
            </div>
            <div className="text-3xl">
              {" "}
              <TbMoneybag />
            </div>
          </div>
        </div>

        {/* Net Balance Card */}
        {/* <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p
                className={`text-2xl font-bold ${
                  (reportData.cashflow?.overallSummary?.netBalance || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(
                  reportData.cashflow?.overallSummary?.netBalance || 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(reportData.cashflow?.overallSummary?.netBalance || 0) >= 0
                  ? "Profit"
                  : "Loss"}
              </p>
            </div>
            <div className="text-3xl">
              {(reportData.cashflow?.overallSummary?.netBalance || 0) >= 0
                ? "📈"
                : "📉"}
            </div>
          </div>
        </div> */}
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Revenue Charts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              💰 Revenue Analysis
            </h2>
            <div className="text-sm text-gray-600">
              Total: {formatCurrency(reportData.revenue?.totalSummary?.totalAmount || 0)}
            </div>
          </div>
          
          {/* Revenue Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                📈 Monthly Revenue Trend
              </h3>
              <RevenueChart
                data={reportData.revenue?.monthlyTrend}
                type="monthly"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                🏢 Revenue by Source
              </h3>
              <RevenueChart
                data={reportData.revenue?.sourceBreakdown}
                type="source"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                ⚡ Revenue by Status
              </h3>
              <RevenueChart
                data={reportData.revenue?.statusBreakdown}
                type="status"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                💳 Payment Methods
              </h3>
              <RevenueChart
                data={reportData.revenue?.paymentMethodBreakdown}
                type="payment"
              />
            </div>
          </div>

          {/* Revenue Pie Chart for Source Distribution */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              🥧 Revenue Distribution by Source
            </h3>
            <RevenueChart
              data={reportData.revenue?.sourceBreakdown}
              type="source-pie"
            />
          </div>
        </div>

        {/* Expense Charts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Expense Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Expenses by Category
              </h3>
              <ExpenseChart
                data={reportData.expenses?.categoryBreakdown}
                type="category-pie"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Monthly Expense Trend
              </h3>
              <ExpenseChart
                data={reportData.expenses?.monthlyTrend}
                type="monthly"
              />
            </div>
          </div>
        </div>

        {/* Petty Cash Charts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Petty Cash Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Petty Cash by Category
              </h3>
              <PettyCashChart
                data={reportData.pettyCash?.categoryBreakdown}
                type="category-pie"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Status Distribution
              </h3>
              <PettyCashChart
                data={[
                  {
                    _id: "pending",
                    totalAmount:
                      reportData.pettyCash?.summary?.pendingAmount || 0,
                  },
                  {
                    _id: "approved",
                    totalAmount:
                      reportData.pettyCash?.summary?.approvedAmount || 0,
                  },
                  {
                    _id: "rejected",
                    totalAmount:
                      reportData.pettyCash?.summary?.rejectedAmount || 0,
                  },
                ].filter((item) => item.totalAmount > 0)}
                type="status-pie"
              />
            </div>
          </div>
        </div>

        {/* Cashflow Charts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cashflow Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Revenue vs Expenses
              </h3>
              <CashflowChart
                data={reportData.cashflow?.cashflowData}
                type="comparison"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Net Cashflow Trend
              </h3>
              <CashflowChart
                data={reportData.cashflow?.cashflowData}
                type="netflow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📈 Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Average Revenue</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(reportData.revenue?.totalSummary?.avgAmount || 0)}
            </p>
            <p className="text-sm text-blue-600">per transaction</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-800">Average Expense</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(
                reportData.expenses?.totalSummary?.avgAmount || 0
              )}
            </p>
            <p className="text-sm text-red-600">per transaction</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Approved Petty Cash</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(
                reportData.pettyCash?.summary?.approvedAmount || 0
              )}
            </p>
            <p className="text-sm text-green-600">
              {reportData.pettyCash?.summary?.approved || 0} transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
