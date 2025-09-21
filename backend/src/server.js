import dotenv from "dotenv";
dotenv.config();  

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import bookRoutes from "./routes/bookRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"; 

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({
  origin: [
    "https://abyd-scrapper.vercel.app", 
    "http://localhost:3000"             
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());


app.use("/api/books", bookRoutes);
app.use("/api/chat", chatRoutes);


console.log(
  "OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "Loaded ✅" : "Missing ❌"
);


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
