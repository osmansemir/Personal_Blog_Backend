import express from "express";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.get("/", getArticles); // GET all
router.get("/:slug", getArticle); // GET one
router.post("/", protect, createArticle); // POST create
router.put("/:id", updateArticle); // PUT update
router.delete("/:id", deleteArticle); // DELETE one

export default router;
