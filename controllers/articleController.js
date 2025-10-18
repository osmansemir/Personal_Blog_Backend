import Article from "../models/Article.js";
import { createError } from "../utils/createError.js";

// Get all articles
export const getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

// Get User articles
export const getUserArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ author: req.params.id });
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

// Get a single article by slug
export const getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
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
    res.status(201).json(savedArticle);
  } catch (err) {
    next(err);
  }
};

// Update an article
export const updateArticle = async (req, res, next) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }, // return the updated doc
    );
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
