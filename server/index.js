const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoute");
const PORT = process.env.PORT || 3000;
const app = express();
const path = require("path");
const userRoute = require("./routes/userRoute");
require("dotenv").config();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
// Comment these routes until they are fully implemented
// app.use("/api", pettycashroute);
// app.use("/api", expenseRoute);
// app.use("/api", revenueRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to Home page!");
});
