import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
