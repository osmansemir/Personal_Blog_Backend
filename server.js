import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import morgan from "morgan";
import articleRoutes from "./routes/articleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mongoose from "mongoose";
import errorHandler from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

// Connect to database
await connectDB();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Parse allowed origins from environment variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : ["http://localhost:3000", "http://localhost:5173"]; // Default for development

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Body parser
app.use(express.json({ limit: "10mb" })); // Parse incoming JSON with size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded data

// General API rate limiting (applies to all routes)
app.use("/api/", apiLimiter);

// Mount the routes
app.use("/api/articles", articleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error Middleware
app.use(errorHandler);

// START SERVER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// GRACEFUL SHUTDOWN
process.on("SIGINT", async () => {
  console.log("\n⏸️ Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// Handle other shutdown signals
process.on("SIGTERM", async () => {
  console.log("\n⏸️  Shutting down gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
