const express = require("express");
const app = express();

// Import user management routes
const userManagementRoutes = require("./routes/userManagementRoute");

// ...existing middleware...

// Register user management routes
app.use("/api/users", userManagementRoutes);
console.log(
  "Routes registered:",
  app._router.stack.map((r) => r.route?.path).filter(Boolean)
);

// Add at the end before module.exports
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler - add this last
app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.url);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
