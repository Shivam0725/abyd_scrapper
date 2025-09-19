import express from "express";
import { chatSearch, getSearchHistory } from "../controllers/chatController.js";

const router = express.Router();

// POST request for searching with ChatGPT
router.post("/search", chatSearch);

// GET request for last 10 searches
router.get("/history", getSearchHistory);

export default router;
