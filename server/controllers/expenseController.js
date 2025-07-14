const Expense = require("../models/expense");

// Generate serial number
const generateSerial = async (req) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      throw new Error("Organization ID missing");
    }

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    const prefix = `EXPN-${month}-${year}-`;

    // Find the last expense for this month and organization
    const lastExpense = await Expense.findOne({
      organizationId: orgId,
      serialNumber: new RegExp(`^${prefix}`),
    }).sort({ serialNumber: -1 });

    let nextNumber = 1;
    if (lastExpense) {
      // Extract the number from the last serial and increment
      const lastNumber = parseInt(lastExpense.serialNumber.split("-")[3]);
      nextNumber = lastNumber + 1;
    }

    // Format with leading zeros
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating serial number:", error);
    throw error;
  }
};

// Create expense entry
const createExpense = async (req, res) => {
  try {
    // console.log("Request body:", req.body);
    // console.log("Request file:", req.file);

    const { date, category, description, paymentType, amount } = req.body;
    const billUrl = req.file ? req.file.path : "";

    // Validate required fields
    if (!date || !category || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: "Date, category, description, and amount are required",
      });
    }

    // Validate amount is a number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number",
      });
    }

    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId || !req.user.id) {
      return res.status(400).json({
        success: false,
        message: "User or organization information missing",
      });
    }

    const serialNumber = await generateSerial(req);

    const expense = await Expense.create({
      serialNumber,
      date,
      category,
      description,
      amount: parsedAmount, // Use the validated parsedAmount
      paymentType,
      billUrl,
      createdBy: req.user.id,
      organizationId: orgId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Expense submitted successfully",
      expense,
    });
  } catch (err) {
    console.error("Expense creation error:", err);

    // Handle validation errors more gracefully
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(
        (error) => error.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating expense: " + (err.message || "Unknown error"),
    });
  }
};

// Get all expenses (filtered by org)
const getExpenses = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization information missing",
      });
    }

    const expenses = await Expense.find({
      organizationId: orgId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    console.error("Fetch expenses error:", err);
    res.status(500).json({
      success: false,
      message:
        "Error fetching expenses: " + (err.message || "Database timeout"),
    });
  }
};

// Update status by admin
const updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update status",
      });
    }

    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization information missing",
      });
    }

    const expense = await Expense.findOne({
      _id: id,
      organizationId: orgId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    expense.status = status;
    expense.updatedBy = req.user.id;
    expense.updatedAt = new Date();
    await expense.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      expense,
    });
  } catch (err) {
    console.error("Status update error:", err);

    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(
        (error) => error.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating status: " + (err.message || "Unknown error"),
    });
  }
};

// Get expense statistics
const getExpenseStats = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization information missing",
      });
    }

    // Get current month's start and end dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Get previous month's start and end dates
    const startOfPrevMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfPrevMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59
    );

    const mongoose = require("mongoose");
    const isValidObjectId = mongoose.Types.ObjectId.isValid(orgId);
    const orgObjectId = isValidObjectId
      ? new mongoose.Types.ObjectId(orgId)
      : orgId;

    // Use aggregation for current month's total
    const currentMonthAgg = await Expense.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: "approved",
          amount: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Use aggregation for previous month's total
    const prevMonthAgg = await Expense.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
          status: "approved",
          amount: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract totals from aggregation results
    const currentMonthTotal =
      currentMonthAgg.length > 0 ? Number(currentMonthAgg[0].total) : 0;
    const prevMonthTotal =
      prevMonthAgg.length > 0 ? Number(prevMonthAgg[0].total) : 0;

    // Calculate percentage change
    let percentageChange = 0;
    if (prevMonthTotal > 0) {
      percentageChange =
        ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    }

    // Get pending count using aggregation
    const pendingCountAgg = await Expense.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          status: "pending",
        },
      },
      {
        $count: "total",
      },
    ]);

    const pendingCount =
      pendingCountAgg.length > 0 ? pendingCountAgg[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        currentMonthTotal,
        prevMonthTotal,
        percentageChange,
        pendingCount,
        month: today.toLocaleString("default", { month: "long" }),
        year: today.getFullYear(),
      },
    });
  } catch (err) {
    console.error("Expense stats error:", err);
    res.status(500).json({
      success: false,
      message:
        "Error fetching expense statistics: " +
        (err.message || "Database timeout"),
    });
  }
};

// Get next serial number
const getNextSerialNumber = async (req, res) => {
  try {
    const serialNumber = await generateSerial(req);
    res.status(200).json({
      success: true,
      nextSerialNumber: serialNumber,
    });
  } catch (err) {
    console.error("Error generating serial number:", err);
    res.status(500).json({
      success: false,
      message:
        "Error generating serial number: " + (err.message || "Unknown error"),
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpenseStatus,
  getExpenseStats,
  getNextSerialNumber,
};
