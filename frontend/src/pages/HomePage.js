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
  const [copiedBookId, setCopiedBookId] = useState(null);

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
        setTimeout(() => setCopiedBookId(null), 1500);
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
        <div className="logo-title">
          <img src="/assets/abyd.png" alt="ABYD Logo" />
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

          <div className="price-wrapper">
            <div className="price-control">
              <button onClick={() => decrementPrice(setMinPrice)}>-</button>
              <input
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <button onClick={() => incrementPrice(setMinPrice)}>+</button>
            </div>
            <div className="price-control">
              <button onClick={() => decrementPrice(setMaxPrice)}>-</button>
              <input
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <button onClick={() => incrementPrice(setMaxPrice)}>+</button>
            </div>
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
              <div className="card-buttons">
                <Link className="details-btn" to={`/books/${b._id}`}>
                  Details
                </Link>
                <div className="copy-wrapper">
                  <button
                    className="copy-btn"
                    onClick={() => handleCopyTitle(b._id, b.title)}
                  >
                    Copy Title
                  </button>
                  {copiedBookId === b._id && <span className="tooltip">Copied!</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      {/* Right column: Chat Assistant */}
      <div className="right-column">
        <h2 className="assistant-title">
          <img src="/assets/abyd.png" alt="ABYD Logo" />
          ABYD Assistant
        </h2>
        <textarea
          placeholder="Ask about any book..."
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
        />
        <button onClick={handleChatSubmit}>Send</button>
        <div className="chat-answer">{chatAnswer && <p>{chatAnswer}</p>}</div>
      </div>
    </div>
  );
}

export default HomePage;
