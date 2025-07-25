const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const resetPasswordController = require("../controllers/resetPasswordController");

router.post("/reset-password", authMiddleware, resetPasswordController);

module.exports = router;
