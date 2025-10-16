import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Article from "../models/Article.js";

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
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export const authorizeOwnership = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check ownership or admin role
    if (
      article.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to modify this article" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
