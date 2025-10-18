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
    if (req.query.featured === "true") query.featured = true;
    if (req.query.tags) query.tags = { $in: req.query.tags.split(",") };

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
    const protectedFields = ["author", "createdAt", "updatedAt", "_id", "__v"];

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
