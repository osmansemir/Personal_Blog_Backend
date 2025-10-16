import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getUsers,
  getUserByID,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Routes
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.get("/:id", protect, authorizeRoles("admin"), getUserByID);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
