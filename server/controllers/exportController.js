const PettyCash = require("../models/pettycash");
const Expense = require("../models/expense");
const Revenue = require("../models/revenue");
const { 
  generatePettyCashPDF, 
  generateExpensePDF, 
  generateRevenuePDF 
} = require("../utils/pdfGenerator");

// Helper function to format date range for display
const formatDateRange = (from, to) => {
  if (!from || !to) return null;
  const fromDate = new Date(from).toLocaleDateString('en-IN');
  const toDate = new Date(to).toLocaleDateString('en-IN');
  return `Report Period: ${fromDate} to ${toDate}`;
};

// Helper function to build date query
const buildDateQuery = (from, to) => {
  const query = {};
  if (from && to) {
    query.date = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }
  return query;
};

// Export Petty Cash PDF
const exportPettyCash = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { from, to } = req.query;

    const query = {
      organizationId,
      ...buildDateQuery(from, to)
    };

    const vouchers = await PettyCash.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    if (!vouchers.length) {
      return res.status(404).json({ 
        message: "No petty cash vouchers found for the specified criteria" 
      });
    }

    const dateRange = formatDateRange(from, to);
    generatePettyCashPDF(vouchers, res, dateRange);
  } catch (err) {
    console.error("Petty Cash PDF Export Error:", err);
    res.status(500).json({ message: "Failed to export petty cash PDF" });
  }
};

// Export Expenses PDF
const exportExpenses = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { from, to } = req.query;

    const query = {
      organizationId,
      ...buildDateQuery(from, to)
    };

    const expenses = await Expense.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    if (!expenses.length) {
      return res.status(404).json({ 
        message: "No expenses found for the specified criteria" 
      });
    }

    const dateRange = formatDateRange(from, to);
    generateExpensePDF(expenses, res, dateRange);
  } catch (err) {
    console.error("Expense PDF Export Error:", err);
    res.status(500).json({ message: "Failed to export expense PDF" });
  }
};

// Export Revenue PDF
const exportRevenue = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { from, to } = req.query;

    const query = {
      organizationId,
      ...buildDateQuery(from, to)
    };

    const revenues = await Revenue.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    if (!revenues.length) {
      return res.status(404).json({ 
        message: "No revenue records found for the specified criteria" 
      });
    }

    const dateRange = formatDateRange(from, to);
    generateRevenuePDF(revenues, res, dateRange);
  } catch (err) {
    console.error("Revenue PDF Export Error:", err);
    res.status(500).json({ message: "Failed to export revenue PDF" });
  }
};

module.exports = { 
  exportPettyCash, 
  exportExpenses, 
  exportRevenue 
};
