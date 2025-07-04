const PettyCash = require("../models/pettycash");
const auth = require("../middlewares/auth");

const createPettyCash = async (req, res) => {
  try {
    const { amount, description, category, requestedBy, date } = req.body;
    if (!amount || !category || !requestedBy) {
      return res.status(400).json({
        success: false,
        message: "Amount, category, and requestedBy are required.",
      });
    }

    // Check if user is system admin
    if (req.user.userId === "admin" || req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "System admin cannot create petty cash vouchers. Please use a company user account.",
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

    const pettyCash = new PettyCash({
      tenantId,
      userId,
      amount,
      description,
      category,
      requestedBy,
      date: date ? date : undefined,
    });

    await pettyCash.save();

    res.status(201).json({ success: true, data: pettyCash });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

const getPettyCash = async (req, res) => {
  try {
    // Check if user is system admin
    if (req.user.userId === "admin" || req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "System admin cannot view petty cash vouchers. Please use a company user account.",
      });
    }

    if (!req.user || !req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant information missing in token.",
      });
    }
    const tenantId = req.user.tenantId;
    const pettyCashList = await PettyCash.find({ tenantId });
    res.status(200).json({ success: true, data: pettyCashList });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

module.exports = { createPettyCash, getPettyCash };
