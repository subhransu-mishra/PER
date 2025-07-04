const express = require("express");
const router = express.Router();
const {
  loginUser,
  register,
  createUserByAdmin,
  getAllTenants,
  getTenantUsers,
} = require("../controllers/authController");
const auth = require("../middlewares/auth");

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/register
router.post("/register", register);

// Admin only routes
router.post("/admin/create-user", auth, createUserByAdmin);
router.get("/admin/tenants", auth, getAllTenants);
router.get("/admin/tenants/:tenantId/users", auth, getTenantUsers);

module.exports = router;
