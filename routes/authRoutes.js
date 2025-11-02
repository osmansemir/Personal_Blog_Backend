import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes - Apply strict rate limiting to auth endpoints to prevent brute-force attacks
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
