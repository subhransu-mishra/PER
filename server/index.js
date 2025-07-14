require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoute");
const PORT = process.env.PORT || 3000;
const app = express();
const path = require("path");
const userRoute = require("./routes/userRoute");
const pettyCashRoutes = require("./routes/pettyCashRoute"); 
const contactRoutes = require("./routes/contactRoute");
const expenseRoutes = require("./routes/expenseRoute");
const revenueRoutes = require("./routes/revenueRoute")
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
app.use("/api/pettycash", pettyCashRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/revenue" , revenueRoutes)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to Home page!");
});
