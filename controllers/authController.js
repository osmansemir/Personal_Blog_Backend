import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { createError } from "../utils/createError.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    //  Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) throw createError(400, "Email already registered");

    //  Create user
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    //  Return response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //  Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw createError(400, "Invalid email or password");

    //  Compare entered password with stored hash
    console.log(req.body);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw createError(400, "Invalid email or password");

    //  Create a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // expires in 1 day
    );

    //  Send token and user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
