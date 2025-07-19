const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Database connection
connectDB();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL, // "https://accrue.onrender.com"
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true, // Optional if using cookies/auth headers
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/expense", require("./routes/expenseRoute"));
app.use("/api/pettycash", require("./routes/pettyCashRoute"));
app.use("/api/revenue", require("./routes/revenueRoute"));
app.use("/api/contact", require("./routes/contactRoute")); 


// Root route
app.get("/", (req, res) => {
  res.send("Accrue Backend is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

