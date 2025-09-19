import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    thumbnail: { type: String },
  },
  { timestamps: true }
);

// index for faster search
bookSchema.index({ title: "text" });

//  force "books" collection
const Book = mongoose.models.Book || mongoose.model("Book", bookSchema, "books");

export default Book;
