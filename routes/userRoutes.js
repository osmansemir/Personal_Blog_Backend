import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getUsers,
  getUserByID,
  deleteUser,
  upgradeToAuthor,
  updateUserRole,
} from "../controllers/userController.js";
import { validate, validateParams } from "../middleware/validateRequest.js";
import { updateRoleSchema, userIdSchema } from "../validators/userValidators.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Routes
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validateParams(userIdSchema),
  getUserByID,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validateParams(userIdSchema),
  strictLimiter, // Strict rate limiting for account deletion
  deleteUser,
);

// Role management
router.put(
  "/me/upgrade-to-author",
  protect,
  strictLimiter, // Limit role upgrades to prevent abuse
  upgradeToAuthor,
); // Self-upgrade to author
router.put(
  "/:id/role",
  protect,
  authorizeRoles("admin"),
  validateParams(userIdSchema),
  validate(updateRoleSchema),
  strictLimiter, // Strict rate limiting for role changes
  updateUserRole,
); // Admin-only role changes

export default router;
