const express = require("express");
const router = express.Router();
const { loginUser, register } = require("../controllers/authController");

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/register
router.post("/register", register);

module.exports = router;
