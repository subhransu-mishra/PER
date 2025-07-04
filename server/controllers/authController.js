const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Tenant = require("../models/tenant");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if it's the hardcoded admin
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          userId: "admin",
          tenantId: "admin-tenant",
          email,
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        token,
        user: {
          name: "System Admin",
          email,
          role: "admin",
        },
      });
    }

    // Otherwise, check in MongoDB for a normal user
    const user = await User.findOne({ email }).populate("tenantId");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId?._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        tenant: user.tenantId?.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, employeeId, companyName } = req.body;

    // Validate input
    if (!email || !password || !employeeId || !companyName) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide email, password, employee ID, and company name",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if company already exists
    let tenant = await Tenant.findOne({ name: companyName });

    // If company doesn't exist, create it
    if (!tenant) {
      tenant = new Tenant({
        name: companyName,
        email: email, // Use the first user's email as tenant contact
        subscriptionStatus: "trial",
      });
      await tenant.save();
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      employeeId,
      tenantId: tenant._id,
      role: "accountant", // Default role
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        tenantId: newUser.tenantId,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          employeeId: newUser.employeeId,
          role: newUser.role,
          tenant: tenant.name,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin-only function to create users for their tenant
const createUserByAdmin = async (req, res) => {
  try {
    // Check if the request is from an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { email, password, employeeId, tenantId } = req.body;

    // Validate input
    if (!email || !password || !employeeId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, employee ID, and tenant ID",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Verify tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(400).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      employeeId,
      tenantId,
      role: "accountant", // Default role for tenant users
    });

    await newUser.save();

    // Send response (don't include password or token)
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          employeeId: newUser.employeeId,
          role: newUser.role,
          tenant: tenant.name,
        },
      },
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all tenants (admin only)
const getAllTenants = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Get tenants error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get users for a specific tenant (admin only)
const getTenantUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { tenantId } = req.params;
    const users = await User.find({ tenantId })
      .populate("tenantId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get tenant users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  loginUser,
  register,
  createUserByAdmin,
  getAllTenants,
  getTenantUsers,
};
