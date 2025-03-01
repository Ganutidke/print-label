// src/lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";


interface ConnectDBResult {
  db: any; // or a more specific type
}
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI, { dbName: "print_labels" });
  } catch (error) {
    console.error("MongoDB Connection Error ❌", error);
  }
};

export default connectDB;
