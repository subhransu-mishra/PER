const jwt = require("jsonwebtoken");
const User = require("../models/user");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin permission required." });
    }
    req.user = {
      id: decoded.id,
      role: user.role,
      organizationId: decoded.organizationId
    };
    next();
  } catch (err) {
    console.error('Admin auth middleware error:', err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = adminAuth;
   