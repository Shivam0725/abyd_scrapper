// Load environment variables first
import dotenv from "dotenv";
dotenv.config();  // ✅ must be at the very top

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import bookRoutes from "./routes/bookRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"; // ChatGPT search

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/books", bookRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Debug: check if OpenAI key is loaded
console.log(
  "OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "Loaded ✅" : "Missing ❌"
);

// ✅ MongoDB connection + server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB connected to:", mongoose.connection.name);
    console.log("   Using URI:", process.env.MONGO_URI);
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err));
