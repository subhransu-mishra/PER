const express = require("express");
const router = express.Router();
const {
  getPettyCashSummary,
  getExpensesSummary,
  getRevenueSummary,
  getCashflowSummary
} = require("../controllers/reportController");
const auth = require("../middlewares/auth");

// All routes require authentication
router.use(auth);

// Report summary endpoints
router.get("/pettycash-summary", getPettyCashSummary);
router.get("/expenses-summary", getExpensesSummary);
router.get("/revenue-summary", getRevenueSummary);
router.get("/cashflow-summary", getCashflowSummary);

module.exports = router;
