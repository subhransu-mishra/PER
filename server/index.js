const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoute");
const pettycashroute = require("./routes/pettyCashRoute");
const expenseRoute = require("./routes/expenseRoute");
const revenueRoute = require("./routes/revenueRoute");
const PORT = process.env.PORT || 3000;
const app = express();
const path = require("path");
require("dotenv").config();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", pettycashroute);
app.use("/api", expenseRoute);
app.use("/api", revenueRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to Home page!");
});
