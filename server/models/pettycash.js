const mongoose = require("mongoose");

const pettyCashSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  requestedBy: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PettyCash", pettyCashSchema);
