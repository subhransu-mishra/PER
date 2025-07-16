const express = require("express");
const router = express.Router();
const {
  addRevenue,
  getRevenues,
  updateRevenue,
  getRevenueById,
  generateRevenueReport,
  getRevenueStats,
} = require("../controllers/revenueController");

const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// Create revenue with invoice upload
router.post("/create", authMiddleware, upload.single("invoice"), addRevenue);

// Get all revenues
router.get("/", authMiddleware, getRevenues);

// Get revenue statistics - this must come BEFORE the /:id route
router.get("/stats", authMiddleware, getRevenueStats);

// Generate revenue report
router.post("/report", authMiddleware, generateRevenueReport);

// Get revenue by ID
router.get("/:id", authMiddleware, getRevenueById);

// Update revenue
router.put("/:id", authMiddleware, upload.single("invoice"), updateRevenue);

module.exports = router;
