const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );
    console.log("Mongodb connected");
  } catch (err) {
    console.log("Mongodb error:", err);
  }
};

module.exports = connectDB;
