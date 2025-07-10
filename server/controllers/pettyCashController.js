const PettyCash = require("../models/pettycash");

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

    const receiptUrl = req.file ? req.file.path : "";

    const entry = await PettyCash.create({
      voucherNumber,
      date,
      transactionType,
      categoryType,
      description,
      amount,
      receipt: receiptUrl,
      createdBy: req.user.id,
      organizationId: req.user.organizationId,
      status: "pending",
    });

    res.status(201).json({
      message: "Petty cash entry created successfully",
      entry,
    });
  } catch (error) {
    console.error("Error creating petty cash entry:", error);
    res.status(500).json({ message: "Server error" });
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

    // Build filter object
    const filter = {
      organizationId: req.user.organizationId,
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
    res.status(500).json({ message: "Server error" });
  }
};

// Get single petty cash entry
const getPettyCashById = async (req, res) => {
  try {
    const entry = await PettyCash.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    }).populate("createdBy", "name email");

    if (!entry) {
      return res.status(404).json({ message: "Petty cash entry not found" });
    }

    res.status(200).json({
      message: "Petty cash entry retrieved successfully",
      entry,
    });
  } catch (error) {
    console.error("Error retrieving petty cash entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a petty cash entry
const approvePettyCash = async (req, res) => {
  try {
    const entry = await PettyCash.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!entry) {
      return res.status(404).json({ message: "Petty cash entry not found" });
    }

    if (entry.status !== "pending") {
      return res.status(400).json({
        message:
          "This entry cannot be approved because it's not in pending state",
      });
    }

    entry.status = "approved";
    await entry.save();

    res.status(200).json({
      message: "Petty cash entry approved successfully",
      entry,
    });
  } catch (error) {
    console.error("Error approving petty cash entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject a petty cash entry
const rejectPettyCash = async (req, res) => {
  try {
    const entry = await PettyCash.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!entry) {
      return res.status(404).json({ message: "Petty cash entry not found" });
    }

    if (entry.status !== "pending") {
      return res.status(400).json({
        message:
          "This entry cannot be rejected because it's not in pending state",
      });
    }

    entry.status = "rejected";
    if (req.body.rejectionReason) {
      entry.rejectionReason = req.body.rejectionReason;
    }
    await entry.save();

    res.status(200).json({
      message: "Petty cash entry rejected successfully",
      entry,
    });
  } catch (error) {
    console.error("Error rejecting petty cash entry:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get organization statistics
const getPettyCashStats = async (req, res) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(0);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    const stats = await PettyCash.aggregate([
      {
        $match: {
          organizationId: req.user.organizationId,
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
          organizationId: req.user.organizationId,
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
    res.status(500).json({ message: "Server error" });
  }
};

// Get next voucher number
const getNextVoucherNumber = async (req, res) => {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    const prefix = `PC-${month}-${year}-`;

    // Find the last voucher number for this month
    const lastVoucher = await PettyCash.findOne({
      organizationId: req.user.organizationId,
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
      message: "Next voucher number retrieved successfully",
      nextVoucherNumber,
    });
  } catch (error) {
    console.error("Error getting next voucher number:", error);
    res.status(500).json({ message: "Server error" });
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
};
