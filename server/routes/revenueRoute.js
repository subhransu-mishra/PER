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

// Debug middleware
const debugRequest = (req, res, next) => {
  console.log("Revenue Route - Request Headers:", req.headers);
  console.log("Revenue Route - Request Body:", req.body);
  console.log("Revenue Route - Request File:", req.file);
  next();
};

// Get statistics
router.get("/stats", authMiddleware, getRevenueStats);

// Get all revenues
router.get("/", authMiddleware, getRevenues);

// Get revenue by ID
router.get("/:id", authMiddleware, getRevenueById);

// Create new revenue
router.post(
  "/create",
  authMiddleware,
  debugRequest,
  upload.single("invoice"),
  debugRequest,
  addRevenue
);

// Update revenue
router.put("/:id", authMiddleware, upload.single("invoice"), updateRevenue);

// Generate revenue report
router.post("/report", authMiddleware, generateRevenueReport);

module.exports = router;
