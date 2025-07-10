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
} = require("../controllers/pettyCashController");

const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// Create new petty cash entry
router.post(
  "/create",
  authMiddleware,
  upload.single("receipt"), // the file field name should be `receipt`
  createPettyCash
);

// Get the next voucher number
router.get("/next-voucher", authMiddleware, getNextVoucherNumber);

// Get organization statistics
router.get("/stats", authMiddleware, getPettyCashStats);

// Get all petty cash entries with pagination and filters
router.get("/", authMiddleware, getPettyCash);

// Get single petty cash entry
router.get("/:id", authMiddleware, getPettyCashById);

// Approve petty cash entry
router.patch("/:id/approve", authMiddleware, approvePettyCash);

// Reject petty cash entry
router.patch("/:id/reject", authMiddleware, rejectPettyCash);

module.exports = router;
