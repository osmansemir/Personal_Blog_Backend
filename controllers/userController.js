import User from "../models/User.js";
import { createError } from "../utils/createError.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserByID = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw createError(404, "User not found");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) throw createError(404, "User not found");
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Self-upgrade to author (any authenticated user)
export const upgradeToAuthor = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if user is already an author or admin
    if (req.user.role === "author" || req.user.role === "admin") {
      throw createError(400, `You are already an ${req.user.role}`);
    }

    // Update user role to author
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "author" },
      { new: true },
    ).select("-password");

    res.json({
      message: "Successfully upgraded to author",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// Admin-only: Update any user's role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    // Validate role
    const validRoles = ["user", "author", "admin"];
    if (!role || !validRoles.includes(role)) {
      throw createError(400, "Invalid role. Must be: user, author, or admin");
    }

    // Prevent admin from changing their own role (safety measure)
    if (targetUserId === req.user._id.toString()) {
      throw createError(
        403,
        "Cannot change your own role. Ask another admin to do this.",
      );
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { role },
      { new: true },
    ).select("-password");

    if (!updatedUser) throw createError(404, "User not found");

    res.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
