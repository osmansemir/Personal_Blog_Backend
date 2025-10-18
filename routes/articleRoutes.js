import express from "express";
import {
  getArticles,
  getArticle,
  getUserArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import {
  protect,
  authorizeRoles,
  authorizeOwnership,
} from "../middleware/authMiddleware.js";
import { validate, validateParams } from "../middleware/validateRequest.js";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdSchema,
  articleSlugSchema,
} from "../validators/articleValidators.js";
import { createArticleLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Routes
router.get("/", getArticles); // GET all
router.get("/user/:id", validateParams(articleIdSchema), getUserArticles); // GET all articles of one user
router.get("/:slug", validateParams(articleSlugSchema), getArticle); // GET one by slug
router.post(
  "/",
  protect,
  authorizeRoles("admin", "author"),
  createArticleLimiter, // Prevent spam article creation
  validate(createArticleSchema),
  createArticle,
); // POST create
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "author"),
  validateParams(articleIdSchema),
  validate(updateArticleSchema),
  authorizeOwnership,
  updateArticle,
); // PUT update
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "author"),
  validateParams(articleIdSchema),
  authorizeOwnership,
  deleteArticle,
); // DELETE one

export default router;
