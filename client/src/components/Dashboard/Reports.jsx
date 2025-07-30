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
      setError(null);
      const token = localStorage.getItem("token");

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

      const [revenueRes, expensesRes, pettyCashRes, cashflowRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/reports/revenue-summary`, { headers }),
          fetch(`${API_BASE_URL}/api/reports/expenses-summary`, { headers }),
          fetch(`${API_BASE_URL}/api/reports/pettycash-summary`, { headers }),
          fetch(`${API_BASE_URL}/api/reports/cashflow-summary`, { headers }),
        ]);

      setReportData({
        revenue: revenueRes.ok ? await revenueRes.json() : null,
        expenses: expensesRes.ok ? await expensesRes.json() : null,
        pettyCash: pettyCashRes.ok ? await pettyCashRes.json() : null,
        cashflow: cashflowRes.ok ? await cashflowRes.json() : null,
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

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
        <div className="text-center text-red-500">
          <h3 className="text-xl font-semibold mb-2">Error Loading Reports</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = reportData.revenue?.totalSummary?.totalAmount || 0;
  const totalExpenses = reportData.expenses?.totalSummary?.totalAmount || 0;
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <PiBankBold className="text-green-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Total Revenue
            </h3>
            <p className="text-2xl text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div className="p-3 bg-red-100 rounded-full mr-4">
            <GiPayMoney className="text-red-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Total Expenses
            </h3>
            <p className="text-2xl text-red-600">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div
            className={`p-3 rounded-full mr-4 ${
              netProfit >= 0 ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            <IoAnalyticsSharp
              className={`text-2xl ${
                netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Net Profit
            </h3>
            <p
              className={`text-2xl font-semibold ${
                netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>

        {/* Petty Cash */}
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div className="p-3 bg-blue-100 rounded-full mr-4">
            <TbMoneybag className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Petty Cash
            </h3>
            <p className="text-2xl text-blue-600">
              {formatCurrency(reportData.pettyCash?.summary?.totalAmount || 0)}
            </p>
          </div>
        </div>

        {/* Cash Flow */}
        {/* <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div className="p-3 bg-purple-100 rounded-full mr-4">
            <MdAccountBalanceWallet className="text-purple-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Cash Flow
            </h3>
            <p className="text-2xl text-purple-600">
              {formatCurrency(reportData.cashflow?.summary?.netFlow || 0)}
            </p>
          </div>
        </div> */}
      </div>

      {/* ----------  (Charts remain unchanged)  ---------- */}
      <div className="space-y-8">
        {/* Revenue Section */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Revenue Analytics</h2>
            <button
              onClick={fetchReportData}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <VscRefresh className="text-gray-600 text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] w-full">
              <RevenueChart
                data={reportData.revenue?.monthlyTrend || []}
                type="monthly"
              />
            </div>
            <div className="h-[400px] w-full">
              <RevenueChart
                data={reportData.revenue?.sourceBreakdown || []}
                type="source-pie"
              />
            </div>
            <div className="h-[400px] w-full">
              <RevenueChart
                data={reportData.revenue?.statusBreakdown || []}
                type="status"
              />
            </div>
            <div className="h-[400px] w-full">
              <RevenueChart
                data={reportData.revenue?.paymentMethodBreakdown || []}
                type="payment"
              />
            </div>
          </div>
        </section>

        {/* Expenses Section */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Expense Analytics</h2>
            <button
              onClick={fetchReportData}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <VscRefresh className="text-gray-600 text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] w-full">
              <ExpenseChart
                data={reportData.expenses?.monthlyTrend || []}
                type="monthly"
              />
            </div>
            <div className="h-[400px] w-full">
              <ExpenseChart
                data={reportData.expenses?.categoryBreakdown || []}
                type="category-pie"
              />
            </div>
            <div className="h-[400px] w-full">
              <ExpenseChart
                data={reportData.expenses?.statusBreakdown || []}
                type="status"
              />
            </div>
            <div className="h-[400px] w-full">
              <ExpenseChart
                data={reportData.expenses?.paymentMethodBreakdown || []}
                type="payment-pie"
              />
            </div>
          </div>
        </section>

        {/* Petty Cash Section */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Petty Cash Analytics</h2>
            <button
              onClick={fetchReportData}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <VscRefresh className="text-gray-600 text-xl" />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] w-full">
              <PettyCashChart
                data={reportData.pettyCash?.monthlyTrend || []}
                type="monthly"
              />
            </div>
            <div className="h-[400px] w-full">
              <PettyCashChart
                data={reportData.pettyCash?.categoryBreakdown || []}
                type="category-pie"
              />
            </div>
            {/* Remove the status-pie chart since it's no longer supported in PettyCashChart component */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
