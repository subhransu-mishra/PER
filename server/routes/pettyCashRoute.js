const express = require("express");
const router = express.Router();
const {
  createPettyCash,
  getPettyCash,
  getPettyCashById,
  approvePettyCash,
  rejectPettyCash,
  getPettyCashStats,
  getNextVoucherNumber,
  getMonthlyPettyCashSummary,
  getMonthlyApprovedTotal,
  generatePettyCashReport,
} = require("../controllers/pettyCashController");

const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// Static routes first
router.get("/monthly-approved-total", authMiddleware, getMonthlyApprovedTotal);
router.get(
  "/monthly-pettycash-summary",
  authMiddleware,
  getMonthlyPettyCashSummary
);
router.get("/next-voucher", authMiddleware, getNextVoucherNumber);
router.get("/stats", authMiddleware, getPettyCashStats);

// Create route
router.post(
  "/create",
  authMiddleware,
  upload.single("receipt"), // the file field name should be `receipt`
  createPettyCash
);

// Main listing route
router.get("/", authMiddleware, getPettyCash);

// Report generation
router.post("/report", authMiddleware, generatePettyCashReport);

// Dynamic parameter routes last
router.get("/:id", authMiddleware, getPettyCashById);
router.patch("/:id/approve", authMiddleware, approvePettyCash);
router.patch("/:id/reject", authMiddleware, rejectPettyCash);

module.exports = router;
