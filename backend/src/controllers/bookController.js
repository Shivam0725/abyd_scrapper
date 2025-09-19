import { exec } from "child_process";
import path from "path";
import Book from "../models/Book.js";

// 🔹 GET /api/books
export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 12, title, rating, inStock, minPrice, maxPrice } = req.query;

    const query = {};

    // 🔍 Title fuzzy search (multi-word safe)
    if (title) {
      const words = title.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        query.title = {
          $regex:
            words
              .map((w) => `(?=.*${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)
              .join("") + ".*",
          $options: "i",
        };
      }
    }

    if (rating) query.rating = { $gte: Number(rating) };
    if (inStock === "true") query.inStock = true;
    if (inStock === "false") query.inStock = false;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // 🪵 Debug logs
    console.log("📥 Incoming filters:", { title, rating, inStock, minPrice, maxPrice });
    console.log("🛠 Built Mongo query:", JSON.stringify(query, null, 2));

    const [total, books] = await Promise.all([
      Book.countDocuments(query),
      Book.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
    ]);

    console.log(`✅ Found ${books.length} / ${total} books`);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
      books,
    });
  } catch (err) {
    console.error("❌ getBooks error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 GET /api/books/:id
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error("❌ getBookById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 POST /api/books/refresh
export const refreshBooks = async (req, res) => {
  try {
    const scraperScript = path.resolve(process.cwd(), "../scraper/src/scraper.js");
    const cmd = `node "${scraperScript}" run`;

    const child = exec(cmd, { env: process.env });

    child.stdout.on("data", (d) => console.log("[scraper]", d.toString().trim()));
    child.stderr.on("data", (d) => console.error("[scraper:err]", d.toString().trim()));
    child.on("exit", (code) => console.log(`[scraper] exited with code ${code}`));

    res.json({ message: "Scraper started" });
  } catch (err) {
    console.error("❌ refreshBooks error:", err);
    res.status(500).json({ message: "Failed to start scraper", error: err.message });
  }
};
