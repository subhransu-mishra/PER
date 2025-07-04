const Expense = require("../models/expense");

const createExpense = async (req, res) => {
  try {
    const { amount, description, category, receiptUrl, date } = req.body;

    if (!amount || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Amount, description, and category are required.",
      });
    }

    // Check if user is system admin
    if (req.user.userId === "admin" || req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "System admin cannot create expenses. Please use a company user account.",
      });
    }

    if (!req.user || !req.user.userId || !req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "User or tenant information missing in token.",
      });
    }

    const userId = req.user.userId;
    const tenantId = req.user.tenantId;

    const expense = new Expense({
      tenantId,
      userId,
      amount,
      description,
      category,
      receiptUrl,
      date: date ? new Date(date) : undefined,
    });

    await expense.save();

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    // Check if user is system admin
    if (req.user.userId === "admin" || req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "System admin cannot view expenses. Please use a company user account.",
      });
    }

    if (!req.user || !req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant information missing in token.",
      });
    }

    const tenantId = req.user.tenantId;
    const expenses = await Expense.find({ tenantId })
      .populate("userId", "email employeeId")
      .populate("approvedBy", "email employeeId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

const updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'.",
      });
    }

    // Only admin can approve/reject expenses
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    expense.status = status;
    expense.approvedBy = req.user.userId;
    expense.approvedAt = new Date();

    await expense.save();

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpenseStatus,
};
