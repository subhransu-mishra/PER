const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpenses,
  updateExpenseStatus,
  getExpenseStats,
  getNextSerialNumber,
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

module.exports = router;
