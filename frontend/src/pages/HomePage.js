// frontend/src/pages/HomePage.js
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./HomePage.css";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function HomePage() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [inStock, setInStock] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [chatQuery, setChatQuery] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [copiedBookId, setCopiedBookId] = useState(null); // For tooltip

  const debouncedSearch = useDebounce(search, 300);
  const BOOKS_PER_PAGE = 10;

  const fetchBooks = useCallback(async () => {
    try {
      const params = {
        page,
        title: debouncedSearch,
        rating,
        inStock,
        minPrice,
        maxPrice,
        limit: BOOKS_PER_PAGE,
      };
      const { data } = await API.get("/books", { params });
      setBooks(data.books);
      setTotalPages(data.pages);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  }, [page, debouncedSearch, rating, inStock, minPrice, maxPrice]);

  const fetchLiveResults = useCallback(async (query) => {
    if (!query) return setLiveResults([]);
    try {
      const { data } = await API.get("/books", { params: { title: query, limit: 5 } });
      setLiveResults(data.books);
    } catch (err) {
      console.error("Error fetching live search:", err);
    }
  }, []);

  const handleChatSubmit = async () => {
    if (!chatQuery.trim()) return;
    try {
      const { data } = await API.post("/chat/search", { query: chatQuery });
      setChatAnswer(data.answer);
    } catch (err) {
      console.error("Chat error:", err);
      setChatAnswer("Failed to get response.");
    }
  };

  const incrementPrice = (setter) => {
    setter((prev) => (prev === "" ? 0 : Number(prev) + 1));
  };

  const decrementPrice = (setter) => {
    setter((prev) => (prev === "" ? 0 : Math.max(0, Number(prev) - 1)));
  };

  const handleCopyTitle = (id, title) => {
    navigator.clipboard.writeText(title)
      .then(() => {
        setCopiedBookId(id);
        setTimeout(() => setCopiedBookId(null), 1500); // Tooltip disappears after 1.5s
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  useEffect(() => {
    fetchBooks();
    fetchLiveResults(debouncedSearch);
  }, [debouncedSearch, page, rating, inStock, minPrice, maxPrice, fetchBooks, fetchLiveResults]);

  return (
    <div className="container home-container">
      {/* Left column: books */}
      <div className="left-column">
        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img src="/assets/abyd.png" alt="ABYD Logo" width={150} style={{ marginRight: "15px" }} />
          <h1>📚 Book Explorer</h1>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search-wrapper">
            <input
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {liveResults.length > 0 && (
              <ul className="live-dropdown">
                {liveResults.map((b) => (
                  <li key={b._id}>
                    <img src={b.thumbnail} alt={b.title} />
                    <Link to={`/books/${b._id}`} onClick={() => setLiveResults([])}>
                      {b.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Any Rating</option>
            <option value="1">1+ stars</option>
            <option value="2">2+ stars</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="5">5 stars</option>
          </select>

          <select value={inStock} onChange={(e) => setInStock(e.target.value)}>
            <option value="">All</option>
            <option value="true">In stock</option>
            <option value="false">Out of stock</option>
          </select>

          {/* Min/Max price with small buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <button type="button" onClick={() => decrementPrice(setMinPrice)} style={{ padding: "4px 8px" }}>-</button>
            <input
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: "60px", textAlign: "center" }}
            />
            <button type="button" onClick={() => incrementPrice(setMinPrice)} style={{ padding: "4px 8px" }}>+</button>

            <button type="button" onClick={() => decrementPrice(setMaxPrice)} style={{ padding: "4px 8px" }}>-</button>
            <input
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: "60px", textAlign: "center" }}
            />
            <button type="button" onClick={() => incrementPrice(setMaxPrice)} style={{ padding: "4px 8px" }}>+</button>
          </div>
        </div>

        {/* Book grid */}
        <div className="grid">
          {books.length === 0 && <p>No books found.</p>}
          {books.map((b) => (
            <div key={b._id} className="card">
              <img src={b.thumbnail} alt={b.title} />
              <h3>{b.title}</h3>
              <p>£{b.price}</p>
              <p>{b.rating} ⭐</p>
              <p>{b.inStock ? "✅ In Stock" : "❌ Out of Stock"}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <Link
                  to={`/books/${b._id}`}
                  style={{
                    padding: "8px 15px",
                    background: "#1a73e8",
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#155ab6"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#1a73e8"}
                >
                  Details
                </Link>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => handleCopyTitle(b._id, b.title)}
                    style={{
                      padding: "8px 12px",
                      background: "#34a853",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#2c8c46"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#34a853"}
                  >
                    Copy Title
                  </button>
                  {copiedBookId === b._id && (
                    <span style={{
                      position: "absolute",
                      top: "-25px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#333",
                      color: "#fff",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap"
                    }}>
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {/* Right column: ABYD Assistant */}
      <div className="right-column">
        <h2 style={{ display: "flex", alignItems: "center", fontSize: "1.6rem", color: "#1a73e8" }}>
          <img src="/assets/abyd.png" alt="ABYD Logo" width={40} style={{ marginRight: "10px" }} />
          ABYD Assistant
        </h2>
        <textarea
          placeholder="Ask about any book..."
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          style={{ width: "100%", minHeight: "200px", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", resize: "vertical" }}
        />
        <button
          onClick={handleChatSubmit}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#1a73e8",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
        <div className="chat-answer" style={{ marginTop: "15px", whiteSpace: "pre-wrap" }}>
          {chatAnswer && <p>{chatAnswer}</p>}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
