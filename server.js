import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import morgan from "morgan";
import articleRoutes from "./routes/articleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import mongoose from "mongoose";

dotenv.config();

// Connect to database
await connectDB();

const app = express();

app.use(cors());
if (process.env.NODE_ENV === "development") app.use(morgan("tiny"));
app.use(express.json()); // Parse incoming JSON

// Mount the routes
app.use("/api/articles", articleRoutes);
app.use("/api/auth", authRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from server");
});

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
