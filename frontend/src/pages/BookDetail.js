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

  if (!book) return <p>Loading...</p>;

  return (
    <div className="book-detail">
      <img src={book.thumbnail} alt={book.title} />
      <h2>{book.title}</h2>
      <p>£{book.price}</p>
      <p>{book.rating} ⭐</p>
      <p>{book.inStock ? "✅ In Stock" : "❌ Out of Stock"}</p>
      <a href={book.url} target="_blank" rel="noopener noreferrer">Buy Now</a>
      <br />
      <Link to="/">⬅ Back</Link>
    </div>
  );
}

export default BookDetail;
