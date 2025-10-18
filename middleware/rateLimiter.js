import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints
 * Prevents brute-force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Rate limiter for article creation
 * Prevents spam article creation
 */
export const createArticleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 article creations per hour
  message: {
    success: false,
    statusCode: 429,
    message: "Too many articles created. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * General API rate limiter
 * Prevents API abuse
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Strict rate limiter for sensitive operations
 * Used for role changes, account deletion, etc.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests for this operation. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});