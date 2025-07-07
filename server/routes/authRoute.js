const express = require("express");
const router = express.Router();
const { registerCompany, loginUser } = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Register a new company and default owner/admin user
// @access  Public
router.post("/register-company", registerCompany);

// @route   POST /api/auth/login
// @desc    Login for any user (owner, admin, accountant)
// @access  Public
router.post("/login", loginUser);


module.exports = router;
