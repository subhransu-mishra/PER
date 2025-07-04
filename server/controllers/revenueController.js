const Revenue = require("../models/revenue");

const createRevenue = async (req, res) => {
  try {
    const { amount, description, source, clientName, invoiceNumber, date } =
      req.body;

    if (!amount || !description || !source) {
      return res.status(400).json({
        success: false,
        message: "Amount, description, and source are required.",
      });
    }

    // Check if user is system admin
    if (req.user.userId === "admin" || req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "System admin cannot create revenue entries. Please use a company user account.",
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

    const revenue = new Revenue({
      tenantId,
      userId,
      amount,
      description,
      source,
      clientName,
      invoiceNumber,
      date: date ? new Date(date) : undefined,
    });

    await revenue.save();

    res.status(201).json({
      success: true,
      data: revenue,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

const getRevenues = async (req, res) => {
  try {
    // Check if user is system admin
    if (req.user.userId === "admin" || req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "System admin cannot view revenues. Please use a company user account.",
      });
    }

    if (!req.user || !req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant information missing in token.",
      });
    }

    const tenantId = req.user.tenantId;
    const revenues = await Revenue.find({ tenantId })
      .populate("userId", "email employeeId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: revenues,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

const updateRevenueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["received", "overdue"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'received' or 'overdue'.",
      });
    }

    const revenue = await Revenue.findById(id);
    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue not found.",
      });
    }

    // Check if user belongs to the same tenant
    if (revenue.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    revenue.status = status;
    await revenue.save();

    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

module.exports = {
  createRevenue,
  getRevenues,
  updateRevenueStatus,
};
