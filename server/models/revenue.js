const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    clientName: {
      type: String,
      required: false,
      default: "",
    },
    companyName: {
      type: String,
      required: false,
      default: "",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    source: {
      type: String,
      enum: ["sales", "services", "investment", "others", "other"],
      required: [true, "Source is required"],
    },
    receivedThrough: {
      type: String,
      enum: ["cash", "card", "bank", "UPI", "upi", "cheque", "other"],
      required: false,
      default: "bank",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank", "UPI", "upi", "cheque", "other"],
      required: false,
      default: "bank",
    },
    invoiceUrl: {
      type: String,
      default: "",
    },
    billUrl: {
      type: String,
      default: "",
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    status: {
      type: String,
      enum: ["pending", "received", "overdue"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
      index: true, // Add index for better query performance
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Enable virtuals when converting to JSON
    toObject: { virtuals: true }, // Enable virtuals when converting to object
  }
);

// Add a virtual field for formatted creator name
revenueSchema.virtual("creatorName").get(function () {
  if (this.createdBy) {
    return (
      this.createdBy.name ||
      this.createdBy.username ||
      this.createdBy.email ||
      "Anonymous"
    );
  }
  return "N/A";
});

// Pre-save hook to handle paymentMethod/receivedThrough synchronization
revenueSchema.pre("save", function (next) {
  console.log("Pre-save hook executing for revenue:", this.toObject());

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

// Post-save hook for debugging
revenueSchema.post("save", function (doc) {
  console.log("Revenue saved successfully:", doc.toObject());
});

module.exports = mongoose.model("Revenue", revenueSchema);
