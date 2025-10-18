import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/authValidators.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Routes - Apply strict rate limiting to auth endpoints to prevent brute-force attacks
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);

export default router;
