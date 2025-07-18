const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Organization = require("../models/organisation");
const User = require("../models/user");

const registerCompany = async (req, res) => {
  try {
    const { companyName, ownerName, email, password, phone } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Step 1: Create Organization
    const newOrg = await Organization.create({
      name: companyName,
      phone,
    });

    // Step 2: Create Company Owner (admin)
    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = await User.create({
      name: ownerName,
      email,
      password: hashedPassword,
      role: "admin",
      isCompanyOwner: true,
      organizationId: newOrg._id,
    });

    // Step 3: Generate Token
    const token = jwt.sign(
      {
        id: owner._id,
        role: owner.role,
        isCompanyOwner: true,
        organizationId: newOrg._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Company registered successfully",
      token,
      user: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
        isCompanyOwner: true,
        organizationId: newOrg._id,
      },
    });
  } catch (error) {
    console.error("Company registration error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate("organizationId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isCompanyOwner: user.isCompanyOwner,
        organizationId: user.organizationId._id,
        subscriptionStatus: user.organizationId.subscriptionStatus,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCompanyOwner: user.isCompanyOwner,
        organizationId: user.organizationId._id,
        subscriptionStatus: user.organizationId.subscriptionStatus,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = { registerCompany, loginUser };
// Get current authenticated user and organization
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("organizationId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCompanyOwner: user.isCompanyOwner,
        organizationId: user.organizationId._id,
        subscriptionStatus: user.organizationId.subscriptionStatus,
      },
      organization: user.organizationId,
    });
  } catch (err) {
    console.error("Error loading current user:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
// Re-export with getCurrentUser
module.exports = { registerCompany, loginUser, getCurrentUser };
