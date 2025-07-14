const PettyCash = require("../models/pettycash");
const mongoose = require("mongoose");

const createPettyCash = async (req, res) => {
  try {
    const {
      voucherNumber,
      date,
      transactionType,
      categoryType,
      description,
      amount,
    } = req.body;

    // Check if user and organization info exists
    if (!req.user || !req.user.id) {
      return res.status(400).json({
        success: false,
        message: "User information missing in token",
      });
    }

    if (!req.user.tenantId && !req.user.organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
      });
    }

    const receiptUrl = req.file ? req.file.path : "";

    const entry = await PettyCash.create({
      voucherNumber,
      date,
      transactionType,
      categoryType,
      description,
      amount,
      receipt: receiptUrl,
      createdBy: req.user.id, // Changed from _id to id
      organizationId: req.user.tenantId || req.user.organizationId, // Support both field names
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Petty cash entry created successfully",
      entry,
    });
  } catch (error) {
    console.error("Error creating petty cash entry:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Error creating petty cash entry: " +
        (error.message || "Unknown error"),
    });
  }
};

// Get all petty cash entries with pagination and filters
const getPettyCash = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const search = req.query.search;

    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
      });
    }

    // Build filter object
    const filter = {
      organizationId: orgId,
    };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { voucherNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { categoryType: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await PettyCash.countDocuments(filter);

    // Get entries with pagination, sorting and populate creator details
    const entries = await PettyCash.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Petty cash entries retrieved successfully",
      entries,
      pagination: {
        total,
        page,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error retrieving petty cash entries:", error);
    res.status(500).json({
      success: false,
      message:
        "Error retrieving petty cash entries: " +
        (error.message || "Database timeout"),
    });
  }
};

// Get single petty cash entry
const getPettyCashById = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
      });
    }

    const entry = await PettyCash.findOne({
      _id: req.params.id,
      organizationId: orgId,
    }).populate("createdBy", "name email");

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Petty cash entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Petty cash entry retrieved successfully",
      entry,
    });
  } catch (error) {
    console.error("Error retrieving petty cash entry:", error);
    res.status(500).json({
      success: false,
      message:
        "Error retrieving petty cash entry: " +
        (error.message || "Database timeout"),
    });
  }
};

// Approve a petty cash entry
const approvePettyCash = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
      });
    }

    const entry = await PettyCash.findOne({
      _id: req.params.id,
      organizationId: orgId,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Petty cash entry not found",
      });
    }

    if (entry.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This entry cannot be approved because it's not in pending state",
      });
    }

    entry.status = "approved";
    entry.approvedBy = req.user.id;
    entry.approvedAt = new Date();
    await entry.save();

    res.status(200).json({
      success: true,
      message: "Petty cash entry approved successfully",
      entry,
    });
  } catch (error) {
    console.error("Error approving petty cash entry:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Error approving petty cash entry: " +
        (error.message || "Unknown error"),
    });
  }
};

// Reject a petty cash entry
const rejectPettyCash = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
      });
    }

    const entry = await PettyCash.findOne({
      _id: req.params.id,
      organizationId: orgId,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Petty cash entry not found",
      });
    }

    if (entry.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This entry cannot be rejected because it's not in pending state",
      });
    }

    entry.status = "rejected";
    entry.rejectedBy = req.user.id;
    entry.rejectedAt = new Date();

    if (req.body.rejectionReason) {
      entry.rejectionReason = req.body.rejectionReason;
    }

    await entry.save();

    res.status(200).json({
      success: true,
      message: "Petty cash entry rejected successfully",
      entry,
    });
  } catch (error) {
    console.error("Error rejecting petty cash entry:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Error rejecting petty cash entry: " +
        (error.message || "Unknown error"),
    });
  }
};

// Get organization statistics
const getPettyCashStats = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
      });
    }

    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(0);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    // Ensure endDate includes the entire day
    endDate.setHours(23, 59, 59, 999);

    // Convert organizationId to ObjectId if valid
    const orgIdForQuery = mongoose.Types.ObjectId.isValid(orgId)
      ? new mongoose.Types.ObjectId(orgId)
      : orgId;

    const stats = await PettyCash.aggregate([
      {
        $match: {
          organizationId: orgIdForQuery,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalEntries: { $sum: 1 },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
            },
          },
          approvedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0],
            },
          },
          rejectedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "rejected"] }, "$amount", 0],
            },
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          approvedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
            },
          },
          rejectedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const categoryStats = await PettyCash.aggregate([
      {
        $match: {
          organizationId: orgIdForQuery,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$categoryType",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Petty cash statistics retrieved successfully",
      stats: stats[0] || {
        totalAmount: 0,
        totalEntries: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
      categoryStats,
    });
  } catch (error) {
    console.error("Error retrieving petty cash statistics:", error);
    res.status(500).json({
      success: false,
      message:
        "Error retrieving petty cash statistics: " +
        (error.message || "Database timeout"),
    });
  }
};

// Get next voucher number
const getNextVoucherNumber = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
      });
    }

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    const prefix = `PC-${month}-${year}-`;

    // Find the last voucher number for this month
    const lastVoucher = await PettyCash.findOne({
      organizationId: orgId,
      voucherNumber: new RegExp(`^${prefix}`),
    })
      .sort({ voucherNumber: -1 })
      .limit(1);

    let nextNumber = 1;
    if (lastVoucher) {
      // Extract the number from the last voucher and increment
      const lastNumber = parseInt(lastVoucher.voucherNumber.split("-")[3]);
      nextNumber = lastNumber + 1;
    }

    // Format with leading zeros
    const nextVoucherNumber = `${prefix}${String(nextNumber).padStart(3, "0")}`;

    res.status(200).json({
      success: true,
      message: "Next voucher number retrieved successfully",
      nextVoucherNumber,
    });
  } catch (error) {
    console.error("Error getting next voucher number:", error);
    res.status(500).json({
      success: false,
      message:
        "Error getting next voucher number: " +
        (error.message || "Unknown error"),
    });
  }
};

const getMonthlyPettyCashSummary = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    // Get current month range
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter entries for current month
    const entries = await PettyCash.find({
      organizationId: orgId,
      date: { $gte: firstDay, $lte: lastDay },
    });

    const totalSpending = entries.reduce((sum, e) => sum + e.amount, 0);
    const totalVouchers = entries.length;
    const pendingVouchers = entries.filter(
      (e) => e.status === "pending"
    ).length;

    res.status(200).json({
      totalSpending,
      totalVouchers,
      pendingVouchers,
    });
  } catch (error) {
    console.error("Monthly summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: " + (error.message || "Database timeout"),
    });
  }
};

const getMonthlyApprovedTotal = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization/Tenant information missing in token",
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

    const result = await PettyCash.aggregate([
      {
        $match: {
          organizationId: mongoose.Types.ObjectId.isValid(orgId)
            ? new mongoose.Types.ObjectId(orgId)
            : orgId,
          status: "approved",
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalApproved: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyTotal = {
      totalApproved: result[0]?.totalApproved || 0,
      count: result[0]?.count || 0,
      month: today.toLocaleString("default", { month: "long" }),
      year: today.getFullYear(),
    };

    res.status(200).json({
      success: true,
      data: monthlyTotal,
    });
  } catch (error) {
    console.error("Error getting monthly approved total:", error);
    res.status(500).json({
      success: false,
      message:
        "Error getting monthly approved total: " +
        (error.message || "Database timeout"),
    });
  }
};

module.exports = {
  createPettyCash,
  getPettyCash,
  getPettyCashById,
  approvePettyCash,
  rejectPettyCash,
  getPettyCashStats,
  getNextVoucherNumber,
  getMonthlyPettyCashSummary,
  getMonthlyApprovedTotal,
};
