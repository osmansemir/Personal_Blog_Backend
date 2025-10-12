import mongoose from "mongoose";

const connnecDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connnecDB;
