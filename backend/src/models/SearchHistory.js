import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    result: { type: Array, default: [] },
  },
  { timestamps: true }
);

const SearchHistory = mongoose.models.SearchHistory || mongoose.model("SearchHistory", searchHistorySchema, "search_histories");

export default SearchHistory;
