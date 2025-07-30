const User = require("../models/user");

// Get all users for an organization
const getOrganizationUsers = async (req, res) => {
  try {
    const orgId = req.user.tenantId || req.user.organizationId;
    
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID not found"
      });
    }

    // Only allow admin to fetch users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only administrators can view users"
      });
    }

    const users = await User.find({ 
      organizationId: orgId 
    }).select('-password -__v');

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {
    console.error("Error fetching organization users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orgId = req.user.tenantId || req.user.organizationId;

    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only administrators can delete users"
      });
    }

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    // Find user and verify they belong to same organization
    const user = await User.findOne({
      _id: userId,
      organizationId: orgId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent deletion of other admins
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: "Cannot delete administrator accounts"
      });
    }

    await User.deleteOne({ _id: userId });

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user"
    });
  }
};

module.exports = {
  getOrganizationUsers,
  deleteUser
};
