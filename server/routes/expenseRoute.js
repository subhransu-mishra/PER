const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpenses,
  updateExpenseStatus,
} = require("../controllers/expenseController");
const auth = require("../middlewares/auth");

router.post("/expenses", auth, createExpense);
router.get("/expenses", auth, getExpenses);
router.patch("/expenses/:id/status", auth, updateExpenseStatus);

module.exports = router;
