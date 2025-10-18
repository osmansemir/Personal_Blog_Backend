import Article from "../models/Article.js";
import { createError } from "../utils/createError.js";
import {
  getPaginationParams,
  createPaginationResponse,
} from "../utils/pagination.js";

// Get all articles with pagination
export const getArticles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    // Build query with optional filters
    const query = {};

    // Featured filter
    if (req.query.featured === "true") query.featured = true;

    // Tags filter
    if (req.query.tags) query.tags = { $in: req.query.tags.split(",") };

    // Search filter (title or description)
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Author filter
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Status filter - Public only sees approved articles
    // Admins can optionally filter by status
    if (req.user && req.user.role === "admin" && req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = "approved"; // Default: only show approved articles
    }

    // Sort options (default: newest first)
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    // Execute query with pagination
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email role") // Populate author details
        .select("-__v"), // Exclude version key
      Article.countDocuments(query),
    ]);

    // Return paginated response
    res.json(createPaginationResponse(articles, total, page, limit));
  } catch (err) {
    next(err);
  }
};

// Get User articles with pagination
export const getUserArticles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const query = { author: req.params.id };

    // Sort options (default: newest first)
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    // Execute query with pagination
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email role") // Populate author details
        .select("-__v"),
      Article.countDocuments(query),
    ]);

    // Return paginated response
    res.json(createPaginationResponse(articles, total, page, limit));
  } catch (err) {
    next(err);
  }
};

// Get a single article by slug
export const getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug })
      .populate("author", "name email role") // Populate author details
      .select("-__v");
    if (!article) throw createError(404, "Article not found");
    res.json(article);
  } catch (err) {
    next(err);
  }
};

// Create a new article
export const createArticle = async (req, res, next) => {
  const { title, slug, tags, description, markdown, featured } = req.body;

  const newArticle = new Article({
    title,
    slug,
    tags,
    description,
    markdown,
    featured,
    author: req.user._id,
  });

  try {
    const savedArticle = await newArticle.save();
    // Populate author details before returning
    await savedArticle.populate("author", "name email role");
    res.status(201).json(savedArticle);
  } catch (err) {
    next(err);
  }
};

// Update an article
export const updateArticle = async (req, res, next) => {
  try {
    // Protected fields that users cannot modify
    const protectedFields = [
      "author",
      "createdAt",
      "updatedAt",
      "_id",
      "__v",
      "status",
      "submittedAt",
      "reviewedAt",
      "reviewedBy",
      "rejectionReason",
    ];

    // Filter out protected fields from request body
    const updateData = Object.keys(req.body)
      .filter((key) => !protectedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Check if there's anything left to update
    if (Object.keys(updateData).length === 0) {
      throw createError(400, "No valid fields to update");
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }, // return the updated doc
    )
      .populate("author", "name email role") // Populate author details
      .select("-__v");
    if (!updatedArticle) throw createError(404, "Article not found");

    res.json(updatedArticle);
  } catch (err) {
    next(err);
  }
};

// Delete an article
export const deleteArticle = async (req, res, next) => {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get author's own articles (including drafts and rejected)
export const getMyArticles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const query = { author: req.user._id };

    // Optional status filter for author's own articles
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Sort options (default: newest first)
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    // Execute query with pagination
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email role")
        .populate("reviewedBy", "name email")
        .select("-__v"),
      Article.countDocuments(query),
    ]);

    res.json(createPaginationResponse(articles, total, page, limit));
  } catch (err) {
    next(err);
  }
};

// Submit draft for review (Author only)
export const submitForReview = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) throw createError(404, "Article not found");

    // Check ownership
    if (article.author.toString() !== req.user._id.toString()) {
      throw createError(403, "You can only submit your own articles");
    }

    // Can only submit drafts or rejected articles
    if (!["draft", "rejected"].includes(article.status)) {
      throw createError(
        400,
        `Cannot submit article with status: ${article.status}`,
      );
    }

    article.status = "pending";
    article.submittedAt = new Date();
    article.rejectionReason = null; // Clear previous rejection reason
    await article.save();

    await article.populate("author", "name email role");

    res.json({
      message: "Article submitted for review",
      article,
    });
  } catch (err) {
    next(err);
  }
};

// Get pending articles (Admin only)
export const getPendingArticles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const query = { status: "pending" };

    // Sort options (default: oldest first for review queue)
    const sortBy = req.query.sortBy || "submittedAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email role")
        .select("-__v"),
      Article.countDocuments(query),
    ]);

    res.json(createPaginationResponse(articles, total, page, limit));
  } catch (err) {
    next(err);
  }
};

// Approve article (Admin only)
export const approveArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) throw createError(404, "Article not found");

    if (article.status !== "pending") {
      throw createError(
        400,
        "Can only approve articles with pending status",
      );
    }

    article.status = "approved";
    article.reviewedAt = new Date();
    article.reviewedBy = req.user._id;
    article.rejectionReason = null;
    await article.save();

    await article.populate("author", "name email role");
    await article.populate("reviewedBy", "name email");

    res.json({
      message: "Article approved successfully",
      article,
    });
  } catch (err) {
    next(err);
  }
};

// Reject article (Admin only)
export const rejectArticle = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      throw createError(400, "Rejection reason is required");
    }

    const article = await Article.findById(req.params.id);

    if (!article) throw createError(404, "Article not found");

    if (article.status !== "pending") {
      throw createError(
        400,
        "Can only reject articles with pending status",
      );
    }

    article.status = "rejected";
    article.reviewedAt = new Date();
    article.reviewedBy = req.user._id;
    article.rejectionReason = reason;
    await article.save();

    await article.populate("author", "name email role");
    await article.populate("reviewedBy", "name email");

    res.json({
      message: "Article rejected",
      article,
    });
  } catch (err) {
    next(err);
  }
};
