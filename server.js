import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import morgan from "morgan";
import articleRoutes from "./routes/articleRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
if (process.env.NODE_ENV === "development") app.use(morgan("tiny"));

app.use(express.json()); // Parse incoming JSON
app.use("/api/articles", articleRoutes); // Mount the routes

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
