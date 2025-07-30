const Revenue = require("../models/revenue");

const addRevenue = async (req, res) => {
  try {
    console.log("AddRevenue - Starting execution");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request user:", req.user);

    const {
      date,
      clientName,
      companyName,
      amount,
      source,
      paymentMethod,
      description,
      invoiceNumber,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      date,
      amount,
      source,
      description,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate user and organization
    const userId = req.user.id || req.user._id;
    const orgId = req.user.organizationId || req.user.tenantId;

    if (!userId || !orgId) {
      console.log("Missing user/org data:", { userId, orgId });
      return res.status(400).json({
        success: false,
        message: "User or organization information missing",
      });
    }

    // Parse amount to ensure it's a number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number",
      });
    }

    // Get invoice URL from file upload
    const invoiceUrl = req.file ? req.file.path : "";

    // Use paymentMethod as receivedThrough if not provided
    const effectivePaymentMethod = paymentMethod || "bank";

    const revenue = await Revenue.create({
      date: new Date(date),
      clientName: clientName || "",
      companyName: companyName || "",
      amount: parsedAmount,
      source,
      paymentMethod: effectivePaymentMethod,
      receivedThrough: effectivePaymentMethod, // Use same value for both fields
      description,
      invoiceUrl,
      billUrl: invoiceUrl, // Set billUrl same as invoiceUrl
      invoiceNumber: invoiceNumber || "",
      createdBy: userId,
      organizationId: orgId,
      status: "pending",
    });

    // Populate the createdBy field with user details
    const populatedRevenue = await Revenue.findById(revenue._id).populate({
      path: "createdBy",
      select: "name username email",
      model: "User",
    });

    console.log("Created revenue with user details:", populatedRevenue);

    res.status(201).json({
      success: true,
      message: "Revenue added successfully",
      revenue: populatedRevenue,
    });
  } catch (error) {
    console.error("Revenue creation error:", error);
    console.error("Error stack:", error.stack);

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating revenue: " + (error.message || "Unknown error"),
    });
  }
};

const getRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find({
      organizationId: req.user.organizationId || req.user.tenantId,
    })
      .populate({
        path: "createdBy",
        select: "name username email", // Include required user fields
        model: "User", // Explicitly specify the model
      })
      .sort({ date: -1 });

    console.log("Fetched revenues with user details:", revenues);
    res.status(200).json(revenues);
  } catch (error) {
    console.error("Fetch revenues error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getRevenueById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can view detailed revenue information",
      });
    }

    // Check if id is a valid MongoDB ObjectId to avoid CastError
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const revenue = await Revenue.findById(id);

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue not found",
      });
    }

    // Check if user has permission to access this revenue
    if (
      revenue.organizationId.toString() !==
      (req.user.organizationId || req.user.tenantId).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this revenue",
      });
    }

    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    console.error("Get revenue by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const updateRevenue = async (req, res) => {
  try {
    // Check if the revenue was created within the last 24 hours
    const revenue = await Revenue.findById(req.params.id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    const createdAt = new Date(revenue.createdAt);
    const now = new Date();
    const diffInHours = (now - createdAt) / (1000 * 60 * 60);

    if (diffInHours > 24) {
      return res.status(403).json({
        success: false,
        message:
          "Revenue entries can only be edited within 24 hours of creation",
      });
    }

    const {
      date,
      clientName,
      companyName,
      amount,
      source,
      description,
      paymentMethod,
      invoiceNumber,
    } = req.body;

    const revenueId = req.params.id;

    // Use paymentMethod as receivedThrough if receivedThrough is not provided
    const effectiveReceivedThrough = paymentMethod || "bank";

    // Check if there's a new file upload
    const invoiceUrl = req.file ? req.file.path : undefined;

    // Build update object
    const updateData = {
      date,
      clientName,
      amount: Number(amount),
      source,
      description,
      paymentMethod,
      receivedThrough: effectiveReceivedThrough,
      invoiceNumber,
    };

    // Only add invoiceUrl if a new file was uploaded
    if (invoiceUrl) {
      updateData.invoiceUrl = invoiceUrl;
    }

    const updatedRevenue = await Revenue.findByIdAndUpdate(
      revenueId,
      updateData,
      { new: true }
    );

    if (!updatedRevenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    res.status(200).json({
      message: "Revenue updated successfully",
      revenue: updatedRevenue,
    });
  } catch (error) {
    console.error("Update revenue error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const generateRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Find all revenues within the date range for this organization
    const revenues = await Revenue.find({
      organizationId: req.user.organizationId || req.user.tenantId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      },
    }).sort({ date: 1 });

    if (revenues.length === 0) {
      return res.status(404).json({
        message: "No revenue data found for the specified date range",
      });
    }

    // In a real implementation, you would use a library like PDFKit to generate a PDF
    // For this example, we'll simulate PDF generation by sending a JSON response
    // This would be replaced with actual PDF generation code

    // PDFKit code would go here to generate the PDF report
    // const PDFDocument = require('pdfkit');
    // const doc = new PDFDocument();
    // const buffers = [];
    // doc.on('data', buffers.push.bind(buffers));
    // doc.on('end', () => {
    //   const pdfData = Buffer.concat(buffers);
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${new Date().toISOString().split('T')[0]}.pdf`);
    //   res.send(pdfData);
    // });

    // For now, we'll just send a sample PDF response
    const fs = require("fs");
    const path = require("path");

    // Create a simple text representation of the data
    let reportText = `Revenue Report\n`;
    reportText += `Date Range: ${new Date(
      startDate
    ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}\n\n`;
    reportText += `Total Revenue: ₹${revenues
      .reduce((total, rev) => total + rev.amount, 0)
      .toLocaleString()}\n\n`;
    reportText += `Transactions:\n`;

    revenues.forEach((rev) => {
      reportText += `Date: ${new Date(rev.date).toLocaleDateString()}\n`;
      reportText += `Description: ${rev.description}\n`;
      reportText += `Amount: ₹${rev.amount.toLocaleString()}\n`;
      reportText += `Source: ${rev.source}\n`;
      reportText += `Payment Method: ${rev.paymentMethod}\n\n`;
    });

    // Create a temporary file to simulate a PDF
    const tempFilePath = path.join(
      __dirname,
      "..",
      "temp",
      `revenue-report-${Date.now()}.txt`
    );

    // Ensure the temp directory exists
    if (!fs.existsSync(path.join(__dirname, "..", "temp"))) {
      fs.mkdirSync(path.join(__dirname, "..", "temp"), { recursive: true });
    }

    fs.writeFileSync(tempFilePath, reportText);

    // Send the file
    res.download(
      tempFilePath,
      `revenue-report-${new Date().toISOString().split("T")[0]}.txt`,
      (err) => {
        // Delete the temporary file after sending
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        if (err && !res.headersSent) {
          return res.status(500).json({ message: "Error generating report" });
        }
      }
    );
  } catch (error) {
    console.error("Generate revenue report error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization information missing",
      });
    }

    // Get current month's start and end dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Get previous month's start and end dates
    const startOfPrevMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfPrevMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59
    );

    const mongoose = require("mongoose");
    const isValidObjectId = mongoose.Types.ObjectId.isValid(orgId);
    const orgObjectId = isValidObjectId
      ? new mongoose.Types.ObjectId(orgId)
      : orgId;

    // Use aggregation for current month's total
    const currentMonthAgg = await Revenue.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          amount: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Use aggregation for previous month's total
    const prevMonthAgg = await Revenue.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
          amount: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract totals from aggregation results
    const currentMonthTotal =
      currentMonthAgg.length > 0 ? Number(currentMonthAgg[0].total) : 0;
    const prevMonthTotal =
      prevMonthAgg.length > 0 ? Number(prevMonthAgg[0].total) : 0;

    // Calculate percentage change
    let percentageChange = 0;
    if (prevMonthTotal > 0) {
      percentageChange =
        ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    }

    // Get top sources
    const topSources = await Revenue.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$source",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        currentMonthTotal,
        prevMonthTotal,
        percentageChange,
        topSources,
        month: today.toLocaleString("default", { month: "long" }),
        year: today.getFullYear(),
      },
    });
  } catch (err) {
    console.error("Revenue stats error:", err);
    res.status(500).json({
      success: false,
      message:
        "Error fetching revenue statistics: " +
        (err.message || "Database timeout"),
    });
  }
};

module.exports = {
  addRevenue,
  getRevenues,
  updateRevenue,
  getRevenueById,
  generateRevenueReport,
  getRevenueStats,
};
