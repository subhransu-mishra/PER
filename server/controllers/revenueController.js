const Revenue = require("../models/Revenue");

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
    const revenue = await Revenue.findById(req.params.id);

    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    // Check if user has permission to access this revenue
    if (
      revenue.organizationId.toString() !==
      (req.user.organizationId || req.user.tenantId).toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this revenue" });
    }

    res.status(200).json(revenue);
  } catch (error) {
    console.error("Get revenue by ID error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { addRevenue, getRevenues, updateRevenue, getRevenueById };
