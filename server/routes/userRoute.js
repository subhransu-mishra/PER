const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");
const auth = require("../middlewares/auth");

// @route   POST /api/users/create
// @desc    Create new user (accountant or another admin)
// @access  Protected - Admin or Owner only
router.post("/create", auth, createUser);

module.exports = router;
