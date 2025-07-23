const Revenue = require("../models/revenue");
const Expense = require("../models/expense");
const PettyCash = require("../models/pettycash");
const mongoose = require("mongoose");

// Get Petty Cash Summary
const getPettyCashSummary = async (req, res) => {
  try {
    console.log('getPettyCashSummary called, user:', req.user);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    console.log('organizationId:', organizationId);
    console.log('organizationId type:', typeof organizationId);

    // Check total documents in PettyCash collection
    const totalDocs = await PettyCash.countDocuments();
    console.log('Total PettyCash documents in collection:', totalDocs);
    
    // Check documents for this organization
    const orgDocs = await PettyCash.countDocuments({ organizationId });
    console.log('PettyCash documents for organizationId:', orgDocs);
    
    // Check a few sample documents to see their structure
    const sampleDocs = await PettyCash.find().limit(3);
    // console.log('Sample PettyCash documents:', JSON.stringify(sampleDocs, null, 2));

    // Total, pending, approved, rejected counts and amounts
    const summary = await PettyCash.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    
    // console.log('Summary aggregation result:', summary);

    // Category-wise breakdown
    const categoryBreakdown = await PettyCash.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$categoryType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Monthly trend
    const monthlyTrend = await PettyCash.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Format summary data
    const formattedSummary = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAmount: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0
    };

    summary.forEach(item => {
      formattedSummary.total += item.count;
      formattedSummary.totalAmount += item.totalAmount;
      formattedSummary[item._id] = item.count;
      formattedSummary[`${item._id}Amount`] = item.totalAmount;
    });

    res.json({
      summary: formattedSummary,
      categoryBreakdown,
      monthlyTrend
    });

  } catch (err) {
    console.error("Error fetching petty cash summary:", err);
    res.status(500).json({ message: "Error fetching petty cash summary" });
  }
};

// Get Expenses Summary
const getExpensesSummary = async (req, res) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

    // Total expenses by category
    const categoryBreakdown = await Expense.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Monthly expenses trend
    const monthlyTrend = await Expense.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Status breakdown
    const statusBreakdown = await Expense.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Payment type breakdown
    const paymentTypeBreakdown = await Expense.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$paymentType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Total summary
    const totalSummary = await Expense.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" }
        }
      }
    ]);

    res.json({
      totalSummary: totalSummary[0] || { totalCount: 0, totalAmount: 0, avgAmount: 0 },
      categoryBreakdown,
      monthlyTrend,
      statusBreakdown,
      paymentTypeBreakdown
    });

  } catch (err) {
    console.error("Error fetching expenses summary:", err);
    res.status(500).json({ message: "Error fetching expenses summary" });
  }
};

// Get Revenue Summary
const getRevenueSummary = async (req, res) => {
  try {
    console.log('getRevenueSummary called, user:', req.user);
    const organizationId = req.user.organizationId;
    console.log('organizationId:', organizationId);
    
    // Check total revenue count
    const totalRevenueCount = await Revenue.countDocuments({ organizationId });
    console.log('Total revenue records for organization:', totalRevenueCount);

    // Monthly revenue trend
    const monthlyTrend = await Revenue.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Revenue by source
    const sourceBreakdown = await Revenue.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    console.log('sourceBreakdown result:', sourceBreakdown);

    // Status breakdown
    const statusBreakdown = await Revenue.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Payment method breakdown
    const paymentMethodBreakdown = await Revenue.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: "$receivedThrough",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Total summary
    const totalSummary = await Revenue.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" }
        }
      }
    ]);

    res.json({
      totalSummary: totalSummary[0] || { totalCount: 0, totalAmount: 0, avgAmount: 0 },
      monthlyTrend,
      sourceBreakdown,
      statusBreakdown,
      paymentMethodBreakdown
    });

  } catch (err) {
    console.error("Error fetching revenue summary:", err);
    res.status(500).json({ message: "Error fetching revenue summary" });
  }
};

// Get Cashflow Summary (Revenue vs Expenses)
const getCashflowSummary = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Monthly revenue vs expenses
    const monthlyRevenue = await Revenue.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          revenue: { $sum: "$amount" }
        }
      }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          expenses: { $sum: "$amount" }
        }
      }
    ]);

    const monthlyPettyCash = await PettyCash.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          pettyCash: { $sum: "$amount" }
        }
      }
    ]);

    // Combine data by month
    const cashflowMap = new Map();

    monthlyRevenue.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      cashflowMap.set(key, { 
        ...cashflowMap.get(key),
        year: item._id.year,
        month: item._id.month,
        revenue: item.revenue 
      });
    });

    monthlyExpenses.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      cashflowMap.set(key, { 
        ...cashflowMap.get(key),
        year: item._id.year,
        month: item._id.month,
        expenses: item.expenses 
      });
    });

    monthlyPettyCash.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      cashflowMap.set(key, { 
        ...cashflowMap.get(key),
        year: item._id.year,
        month: item._id.month,
        pettyCash: item.pettyCash 
      });
    });

    // Convert to array and calculate net cashflow
    const cashflowData = Array.from(cashflowMap.values()).map(item => ({
      year: item.year,
      month: item.month,
      revenue: item.revenue || 0,
      expenses: item.expenses || 0,
      pettyCash: item.pettyCash || 0,
      totalExpenses: (item.expenses || 0) + (item.pettyCash || 0),
      netCashflow: (item.revenue || 0) - ((item.expenses || 0) + (item.pettyCash || 0))
    })).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    }).slice(-12); // Last 12 months

    // Overall totals
    const overallTotals = await Promise.all([
      Revenue.aggregate([
        { $match: { organizationId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $match: { organizationId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      PettyCash.aggregate([
        { $match: { organizationId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const totalRevenue = overallTotals[0][0]?.total || 0;
    const totalExpenses = overallTotals[1][0]?.total || 0;
    const totalPettyCash = overallTotals[2][0]?.total || 0;
    const totalOutflow = totalExpenses + totalPettyCash;
    const netBalance = totalRevenue - totalOutflow;

    res.json({
      cashflowData,
      overallSummary: {
        totalRevenue,
        totalExpenses,
        totalPettyCash,
        totalOutflow,
        netBalance
      }
    });

  } catch (err) {
    console.error("Error fetching cashflow summary:", err);
    res.status(500).json({ message: "Error fetching cashflow summary" });
  }
};

module.exports = {
  getPettyCashSummary,
  getExpensesSummary,
  getRevenueSummary,
  getCashflowSummary
};
