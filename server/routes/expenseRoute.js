const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpenses,
  updateExpenseStatus,
  getExpenseStats,
  getNextSerialNumber,
  generateExpenseReport,
  editExpense, // Import the new controller
} = require("../controllers/expenseController");

const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// Get next serial number
router.get("/next-serial", authMiddleware, getNextSerialNumber);

// Get statistics
router.get("/stats", authMiddleware, getExpenseStats);

// Get all expenses
router.get("/", authMiddleware, getExpenses);

// Create new expense
router.post("/create", authMiddleware, upload.single("bill"), createExpense);

// Update expense status
router.patch("/:id/status", authMiddleware, updateExpenseStatus);

// Generate expense report
router.post("/report", authMiddleware, generateExpenseReport);

// Edit expense entry (PUT for full update)
router.put("/:id/edit", authMiddleware, upload.single("bill"), editExpense);

module.exports = router;
