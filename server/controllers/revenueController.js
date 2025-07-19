const Revenue = require("../models/revenue");

const addRevenue = async (req, res) => {
  try {
    const {
      date,
      clientName,
      companyName,
      amount,
      source,
      receivedThrough,
      paymentMethod, // Add paymentMethod from request body
      description,
      billUrl, // Add billUrl from request body
    } = req.body;

    console.log("Revenue request body:", req.body);

    // Use paymentMethod as receivedThrough if receivedThrough is not provided
    const effectiveReceivedThrough = receivedThrough || paymentMethod || "bank";

    const invoiceUrl = req.file ? req.file.path : billUrl || "";

    const revenue = await Revenue.create({
      date,
      clientName,
      companyName,
      amount,
      source,
      receivedThrough: effectiveReceivedThrough,
      paymentMethod,
      invoiceUrl,
      billUrl,
      description,
      createdBy: req.user.id,
      organizationId: req.user.organizationId || req.user.tenantId,
      status: "pending",
    });

    res.status(201).json({
      message: "Revenue added successfully",
      revenue,
    });
  } catch (error) {
    console.error("Revenue error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find({
      organizationId: req.user.organizationId || req.user.tenantId,
    }).sort({ date: -1 });

    res.status(200).json(revenues);
  } catch (error) {
    console.error("Fetch revenues error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateRevenue = async (req, res) => {
  try {
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

const getRevenueById = async (req, res) => {
  try {
    const { id } = req.params;

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
