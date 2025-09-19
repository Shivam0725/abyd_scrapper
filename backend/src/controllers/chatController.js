// src/controllers/chatController.js
import OpenAI from "openai";
import SearchHistory from "../models/SearchHistory.js";

// ChatGPT search
export const chatSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    // Initialize OpenAI inside the function (ensures process.env is loaded)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Call OpenAI for search suggestions (short answer, fast)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a smart assistant for book queries." },
        { role: "user", content: `Answer briefly for the query: "${query}"` },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    const answer = completion.choices?.[0]?.message?.content || "No response";

    // Save search to history
    const history = new SearchHistory({ query, result: [answer] });
    await history.save();

    res.json({ query, answer });
  } catch (error) {
    console.error("ChatGPT search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

// Optional: Get last 10 search histories
export const getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to get search history" });
  }
};
