import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in .env");
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected");
      return;
    }
    await mongoose.connect(uri, { dbName: "book_explorer" });
    console.log("✅ MongoDB connected (backend)");
  } catch (err) {
    console.error("❌ MongoDB connection error (backend):", err.message || err);
    process.exit(1);
  }
};

export default connectDB;
