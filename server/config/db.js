const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
      maxPoolSize: 10, // Increase connection pool size
    });
    console.log("MongoDB connected successfully");

    // Drop the employeeId index if it exists
    const User = mongoose.model("User");
    try {
      await User.collection.dropIndex("employeeId_1");
      console.log("Successfully dropped employeeId index");
    } catch (indexError) {
      // If the index doesn't exist, that's fine
      if (!indexError.message.includes("index not found")) {
        console.log("Note: No employeeId index to drop");
      }
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);

    // Provide more helpful error information
    if (
      err.message.includes("connection timed out") ||
      err.message.includes("Could not connect to any servers")
    ) {
      console.error("\n============================================");
      console.error("CONNECTION TROUBLESHOOTING STEPS:");
      console.error(
        "1. Verify your MongoDB Atlas connection string in your .env file"
      );
      console.error(
        "2. Make sure your current IP address is whitelisted in MongoDB Atlas:"
      );
      console.error("   - Log in to MongoDB Atlas");
      console.error("   - Go to Network Access section");
      console.error("   - Click 'Add IP Address' and add your current IP");
      console.error("3. Check if your MongoDB Atlas cluster is running");
      console.error(
        "4. Ensure your network allows outbound connections to MongoDB Atlas"
      );
      console.error("============================================\n");
    }

    // Exit with failure in production, but allow development to continue
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
