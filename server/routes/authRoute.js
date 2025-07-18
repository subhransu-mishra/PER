const express = require("express");
const router = express.Router();
const {
  registerCompany,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
// @route   POST /api/auth/register
// @desc    Register a new company and default owner/admin user
// @access  Public
router.post("/register-company", registerCompany);

// @route   POST /api/auth/login
// @desc    Login for any user (owner, admin, accountant)
// @access  Public
router.post("/login", loginUser);
// Get current authenticated user
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
