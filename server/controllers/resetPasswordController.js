const bcrypt = require("bcryptjs");
const User = require("../models/user");

const resetPasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate all inputs are provided
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Make sure req.user.id exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Make sure user.password exists before comparing
    if (!user.password) {
      console.error("User password is undefined for user:", user._id);
      return res
        .status(400)
        .json({ message: "Cannot reset password. Contact administrator." });
    }

    
    try {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    } catch (compareError) {
      console.error("Password comparison error:", compareError);
      return res
        .status(500)
        .json({ message: "Error verifying current password" });
    }

    // Generate new hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = resetPasswordController;
