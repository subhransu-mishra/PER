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

    if (!req.user || !req.user.organizationId) {
      return res.status(400).json({
        success: false,
        message: "User or organization information missing in token.",
      });
    }

    const pettyCash = new PettyCash({
      organizationId: req.user.organizationId,
      userId: req.user._id,
      amount,
      description,
      category,
      requestedBy,
      date: date ? new Date(date) : new Date(),
      status: "pending",
    });

    await pettyCash.save();

    res.status(201).json({ success: true, data: pettyCash });
  } catch (err) {
    console.error("Error creating petty cash:", err);
    res.status(500).json({
      success: false,
      message: "Error creating petty cash entry",
    });
  }
};

const getPettyCash = async (req, res) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(400).json({
        success: false,
        message: "User or organization information missing in token.",
      });
    }

    // Find all petty cash entries for the user's organization
    const pettyCashEntries = await PettyCash.find({
      organizationId: req.user.organizationId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: pettyCashEntries,
    });
  } catch (err) {
    console.error("Error fetching petty cash entries:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching petty cash entries",
    });
  }
};

module.exports = { createPettyCash, getPettyCash };
