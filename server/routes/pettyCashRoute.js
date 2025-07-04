const express = require("express");
const router = express.Router();
const {
  createPettyCash,
  getPettyCash,
} = require("../controllers/pettyCashController");
const auth = require("../middlewares/auth");

router.post("/petty-cash", auth, createPettyCash);
router.get("/petty-cash", auth, getPettyCash);

module.exports = router;
