import mongoose from "mongoose";
import { env } from "./env";
import { applyDatabasePolicy, databaseOptions } from "./databasePolicy";

applyDatabasePolicy(env.NODE_ENV === "production");

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, databaseOptions(env.NODE_ENV === "production"));
    console.log("MongoDB connected");
  } catch (error) {
    throw new Error("MongoDB connection failed");
  }
};

export default connectDB;
