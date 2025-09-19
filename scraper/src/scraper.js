import axios from "axios";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Book from "./models/Book.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || "https://books.toscrape.com";

// rating text to number
const ratingMap = { "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5 };

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "book_explorer" });
  console.log("✅ MongoDB connected (scraper)");
}

async function scrapeBooks() {
  let page = 1;
  let hasNext = true;
  let books = [];

  while (hasNext) {
    const url = `${BASE_URL}/catalogue/page-${page}.html`;
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      $(".product_pod").each((_, el) => {
        const title = $(el).find("h3 a").attr("title");
        const relativeUrl = $(el).find("h3 a").attr("href");
        const bookUrl = new URL(relativeUrl, `${BASE_URL}/catalogue/`).href;
        const priceText = $(el).find(".price_color").text().trim().replace("£", "");
        const price = parseFloat(priceText);
        const stockText = $(el).find(".availability").text().trim();
        const inStock = stockText.includes("In stock");
        const ratingClass = $(el).find(".star-rating").attr("class")?.split(" ")[1];
        const rating = ratingMap[ratingClass] || 0;
        const thumbnailRel = $(el).find("img").attr("src");
        const thumbnail = new URL(thumbnailRel, BASE_URL).href;

        books.push({ title, url: bookUrl, price, inStock, rating, thumbnail });
      });

      hasNext = $(".next a").length > 0;
      page++;
    } catch (err) {
      hasNext = false;
    }
  }

  return books;
}

export async function runScraper() {
  try {
    await connectDB();
    console.log("🔎 Starting scrape...");
    const books = await scrapeBooks();

    // upsert (update or insert)
    for (const b of books) {
      await Book.findOneAndUpdate({ url: b.url }, b, { upsert: true, new: true });
    }

    console.log(`✅ Scraping complete. ${books.length} books saved/updated.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Scraper failed:", err.message || err);
    process.exit(1);
  }
}

// Allow CLI run: node src/scraper.js run
if (process.argv[2] === "run") {
  runScraper();
}
