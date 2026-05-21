const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI from .env
 * Exits the process on failure so the app never runs without a DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options silence deprecation warnings in Mongoose 7+
      // (they are the defaults, but being explicit is good practice)
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;