import mongoose from "mongoose";

export async function connectDb(url: string): Promise<void> {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
