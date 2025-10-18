import express from "express";
import {
  getArticles,
  getArticle,
  getUserArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
  submitForReview,
  getPendingArticles,
  approveArticle,
  rejectArticle,
} from "../controllers/articleController.js";
import {
  protect,
  authorizeRoles,
  authorizeOwnership,
  optionalAuth,
} from "../middleware/authMiddleware.js";
import { validate, validateParams } from "../middleware/validateRequest.js";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdSchema,
  articleSlugSchema,
  rejectArticleSchema,
} from "../validators/articleValidators.js";
import { createArticleLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes (with optional auth for admin status filtering)
router.get("/", optionalAuth, getArticles); // GET all approved (or filter by status if admin)
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

// Draft workflow routes
router.get("/my/articles", protect, getMyArticles); // GET author's own articles (all statuses)
router.post(
  "/:id/submit",
  protect,
  authorizeRoles("admin", "author"),
  validateParams(articleIdSchema),
  submitForReview,
); // Submit draft for review

// Admin review routes
router.get(
  "/admin/pending",
  protect,
  authorizeRoles("admin"),
  getPendingArticles,
); // GET pending articles for review
router.post(
  "/:id/approve",
  protect,
  authorizeRoles("admin"),
  validateParams(articleIdSchema),
  approveArticle,
); // Approve article
router.post(
  "/:id/reject",
  protect,
  authorizeRoles("admin"),
  validateParams(articleIdSchema),
  validate(rejectArticleSchema),
  rejectArticle,
); // Reject article with reason

export default router;
