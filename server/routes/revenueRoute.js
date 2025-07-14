const express = require("express");
const router = express.Router();
const {
  createRevenue,
  getRevenues,
  updateRevenueStatus,
} = require("../controllers/revenueController");
const auth = require("../middlewares/auth");

router.post("/create", auth, createRevenue);
router.get("/revenues", auth, getRevenues);
router.patch("/revenues/:id/status", auth, updateRevenueStatus);

module.exports = router;
