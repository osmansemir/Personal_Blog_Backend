import express from "express";
import {
  getArticles,
  getArticle,
  getUserArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.get("/", getArticles); // GET all
router.get("/:slug", getArticle); // GET one
router.get("/:id", getUserArticles); // GET all articles of one user
router.post("/", protect, authorizeRoles("admin", "author"), createArticle); // POST create
router.put("/:id", protect, authorizeRoles("admin", "author"), updateArticle); // PUT update
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "author"),
  deleteArticle,
); // DELETE one

export default router;
