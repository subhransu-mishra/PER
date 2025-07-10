const mongoose = require("mongoose");

const pettyCashSchema = new mongoose.Schema({
  voucherNumber: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["cash", "bank", "upi"],
    required: true,
  },
  categoryType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  receipt: {
    type: String, // Cloudinary URL
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("PettyCash", pettyCashSchema);
