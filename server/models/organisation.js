const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  subscriptionStatus: {
    type: String,
    enum: ["trial", "active", "expired"],
    default: "trial",
  },
  plan: {
    type: String,
    enum: ["free", "basic", "pro"],
    default: "free",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Organization", organizationSchema);

