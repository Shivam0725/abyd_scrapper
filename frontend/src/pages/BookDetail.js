import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useParams, Link } from "react-router-dom";
import "./BookDetail.css";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await API.get(`/books/${id}`);
        setBook(data);
      } catch (err) {
        console.error("Error fetching book:", err);
      }
    };
    fetchBook();
  }, [id]);

  if (!book) return <p className="loading">Loading...</p>;

  return (
    <div className="detail-container">
      <div className="detail-card">
        <img src={book.thumbnail} alt={book.title} />
        <h2>{book.title}</h2>
        <p className="price">£{book.price}</p>
        <p className="rating">{book.rating} ⭐</p>
        <p className="stock">{book.inStock ? "In Stock" : "Out of Stock"}</p>
        <a
          href={book.url}
          target="_blank"
          rel="noopener noreferrer"
          className="detail-link"
        >
          Buy Now
        </a>
        <br />
        <Link to="/" className="back-link">
          Back
        </Link>
      </div>
    </div>
  );
}

export default BookDetail;
