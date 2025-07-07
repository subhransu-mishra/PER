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

    if (!req.user || !req.user.organizationId) {
      return res.status(400).json({
        success: false,
        message: "User or organization information missing in token.",
      });
    }

    const expense = new Expense({
      organizationId: req.user.organizationId,
      userId: req.user._id,
      amount,
      description,
      category,
      receiptUrl,
      date: date ? new Date(date) : new Date(),
      status: "pending",
    });

    await expense.save();

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({
      success: false,
      message: "Error creating expense",
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(400).json({
        success: false,
        message: "User or organization information missing in token.",
      });
    }

    // Find all expenses for the user's organization
    const expenses = await Expense.find({
      organizationId: req.user.organizationId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching expenses",
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
