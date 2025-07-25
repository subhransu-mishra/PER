const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  exportPettyCash,
  exportExpenses,
  exportRevenue,
} = require("../controllers/exportController");

// @route   GET /api/export/pettycash
// @desc    Export petty cash vouchers as PDF
// @access  Private
// @query   from (optional) - Start date (YYYY-MM-DD)
// @query   to (optional) - End date (YYYY-MM-DD)
router.get("/pettycash", authMiddleware, exportPettyCash);

// @route   GET /api/export/expense
// @desc    Export expenses as PDF
// @access  Private
// @query   from (optional) - Start date (YYYY-MM-DD)
// @query   to (optional) - End date (YYYY-MM-DD)
router.get("/expense", authMiddleware, exportExpenses);

// @route   GET /api/export/revenue
// @desc    Export revenue records as PDF
// @access  Private
// @query   from (optional) - Start date (YYYY-MM-DD)
// @query   to (optional) - End date (YYYY-MM-DD)
router.get("/revenue", authMiddleware, exportRevenue);

module.exports = router;
