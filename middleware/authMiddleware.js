import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Article from "../models/Article.js";
import { createError } from "../utils/createError.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    // 1️⃣ Check if token exists in the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // 2️⃣ Verify the token using your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3️⃣ Attach the user to req (without password)
      req.user = await User.findById(decoded.id).select("-password");

      // 4️⃣ Continue to the next middleware/route
      next();
    } else {
      throw createError(401, "Not authorized, invalid token");
    }
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(403, "Access denied"));
    }
    next();
  };
};

export const authorizeOwnership = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      throw createError(404, "Article not found");
    }

    if (
      article.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw createError(403, "You are not allowed to modify this article");
    }

    next();
  } catch (error) {
    next(error);
  }
};
