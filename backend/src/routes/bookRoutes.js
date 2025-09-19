import express from "express";
import { getBooks, getBookById, refreshBooks } from "../controllers/bookController.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/refresh", refreshBooks);

export default router;
