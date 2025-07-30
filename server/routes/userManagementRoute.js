const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  getOrganizationUsers,
  deleteUser,
} = require("../controllers/userManagementController");

// Make sure these routes match exactly what the frontend is calling
router.get("/organization-users", authMiddleware, getOrganizationUsers); // This matches the frontend URL
router.delete("/delete/:userId", authMiddleware, deleteUser);

module.exports = router;
