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

    if (!req.user || !req.user.organizationId) {
      return res.status(400).json({
        success: false,
        message: "User or organization information missing in token.",
      });
    }

    const revenue = new Revenue({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      amount,
      description,
      source,
      clientName,
      invoiceNumber,
      date: date ? new Date(date) : new Date(),
      status: "pending",
    });

    await revenue.save();

    res.status(201).json({
      success: true,
      data: revenue,
    });
  } catch (err) {
    console.error("Error creating revenue:", err);

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
      message: "Error creating revenue: " + (err.message || "Unknown error"),
    });
  }
};

const getRevenues = async (req, res) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(400).json({
        success: false,
        message: "User or organization information missing in token.",
      });
    }

    // Find all revenues for the user's organization
    const revenues = await Revenue.find({
      organizationId: req.user.organizationId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: revenues,
    });
  } catch (err) {
    console.error("Error fetching revenues:", err);
    res.status(500).json({
      success: false,
      message:
        "Error fetching revenues: " + (err.message || "Database timeout"),
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

    // Check if user belongs to the same organization
    if (
      revenue.organizationId.toString() !== req.user.organizationId.toString()
    ) {
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
    console.error("Error updating revenue status:", err);

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
      message: "Server error: " + (err.message || "Unknown error"),
    });
  }
};

module.exports = {
  createRevenue,
  getRevenues,
  updateRevenueStatus,
};
