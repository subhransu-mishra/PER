require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const pettyCashRoutes = require("./routes/pettyCashRoute");
const contactRoutes = require("./routes/contactRoute");
const expenseRoutes = require("./routes/expenseRoute");
const revenueRoutes = require("./routes/revenueRoute");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle preflight requests for all routes
app.options("*", cors({
  origin: allowedOrigin,
  credentials: true,
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/pettycash", pettyCashRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/revenue", revenueRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to Home page!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
