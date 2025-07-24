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
        console.error(
          "Revenue API error:",
          revenueRes.status,
          await revenueRes.text()
        );
      }

      // Handle expenses response
      if (expensesRes.ok) {
        expensesData = await expensesRes.json();
      } else {
        console.error(
          "Expenses API error:",
          expensesRes.status,
          await expensesRes.text()
        );
      }

      // Handle petty cash response
      if (pettyCashRes.ok) {
        pettyCashData = await pettyCashRes.json();
      } else {
        console.error(
          "PettyCash API error:",
          pettyCashRes.status,
          await pettyCashRes.text()
        );
      }

      // Handle cashflow response
      if (cashflowRes.ok) {
        cashflowData = await cashflowRes.json();
      } else {
        console.error(
          "Cashflow API error:",
          cashflowRes.status,
          await cashflowRes.text()
        );
      }

      // Data is already processed above

      console.log("Revenue Data:", revenueData);
      console.log("Revenue sourceBreakdown:", revenueData?.sourceBreakdown);
      console.log("Revenue monthlyTrend:", revenueData?.monthlyTrend);
      console.log("Revenue statusBreakdown:", revenueData?.statusBreakdown);
      console.log(
        "Revenue paymentMethodBreakdown:",
        revenueData?.paymentMethodBreakdown
      );

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
        <div className="text-center text-red-500">
          <h3 className="text-xl font-semibold mb-2">Error Loading Reports</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <PiBankBold className="text-green-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Total Revenue
            </h3>
            <p className="text-2xl text-green-600">
              {formatCurrency(
                reportData.revenue?.totalSummary?.totalAmount || 0
              )}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div className="p-3 bg-red-100 rounded-full mr-4">
            <GiPayMoney className="text-red-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Total Expenses
            </h3>
            <p className="text-2xl text-red-600">
              {formatCurrency(
                reportData.expenses?.totalSummary?.totalAmount || 0
              )}
            </p>
          </div>
        </div>
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
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center">
          <div className="p-3 bg-purple-100 rounded-full mr-4">
            <MdAccountBalanceWallet className="text-purple-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Net Balance
            </h3>
            <p className="text-2xl text-purple-600">
              {formatCurrency(
                reportData.cashflow?.overallSummary?.netBalance || 0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Revenue Section */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Revenue Analytics</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchReportData()}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <VscRefresh className="text-gray-600 text-xl" />
              </button>
            </div>
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
            <div className="flex space-x-2">
              <button
                onClick={() => fetchReportData()}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <VscRefresh className="text-gray-600 text-xl" />
              </button>
            </div>
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

        {/* Petty Cash Section with Enhanced Visualizations */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Petty Cash Analytics</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchReportData()}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <VscRefresh className="text-gray-600 text-xl" />
              </button>
            </div>
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
            <div className="h-[400px] w-full">
              <PettyCashChart
                data={reportData.pettyCash?.statusBreakdown || []}
                type="status-pie"
              />
            </div>
          </div>
        </section>

        {/* Cashflow Analysis Section */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Cashflow Analysis</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchReportData()}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <VscRefresh className="text-gray-600 text-xl" />
              </button>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <CashflowChart data={reportData.cashflow?.cashflowData || []} />
          </div>
        </section>
      </div>

      {/* Summary Tables for smaller screens */}
      <div className="mt-8 space-y-6 lg:hidden">
        {/* Revenue Summary */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Revenue Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.revenue?.sourceBreakdown?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item._id}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Expenses Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.expenses?.categoryBreakdown?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item._id}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
