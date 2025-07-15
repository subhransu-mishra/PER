const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  clientName: {
    type: String,
    required: false,
  },
  companyName: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ["sales", "services", "investment", "others", "other"],
    required: true,
  },
  receivedThrough: {
    type: String,
    enum: ["cash", "card", "bank", "UPI", "upi", "cheque", "other"],
    required: false, // Changed to false since we handle default in controller
    default: "bank", // Default value if none provided
  },
  paymentMethod: {
    type: String,
    // This is an alias for receivedThrough for compatibility with frontend
  },
  invoiceUrl: {
    type: String, // cloudinary receipt URL
    default: "",
  },
  billUrl: {
    type: String, // URL for bill/invoice (alias for invoiceUrl)
    default: "",
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "received", "overdue"],
    default: "pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to handle paymentMethod/receivedThrough synchronization
revenueSchema.pre("save", function (next) {
  // If paymentMethod is set but receivedThrough is not, use paymentMethod value
  if (this.paymentMethod && !this.receivedThrough) {
    this.receivedThrough = this.paymentMethod;
  }
  // If receivedThrough is set but paymentMethod is not, use receivedThrough value
  else if (this.receivedThrough && !this.paymentMethod) {
    this.paymentMethod = this.receivedThrough;
  }
  // Ensure at least one has a value
  else if (!this.receivedThrough && !this.paymentMethod) {
    this.receivedThrough = "bank";
    this.paymentMethod = "bank";
  }

  // If billUrl is set but invoiceUrl is not, use billUrl value
  if (this.billUrl && !this.invoiceUrl) {
    this.invoiceUrl = this.billUrl;
  }
  // If invoiceUrl is set but billUrl is not, use invoiceUrl value
  else if (this.invoiceUrl && !this.billUrl) {
    this.billUrl = this.invoiceUrl;
  }

  next();
});

module.exports = mongoose.model("Revenue", revenueSchema);
