const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

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
    console.log("MongoDB error:", err);
  }
};

module.exports = connectDB;
