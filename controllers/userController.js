import User from "../models/User.js";
import { createError } from "../utils/createError.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserByID = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw createError(404, "User not found");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) throw createError(404, "User not found");
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
