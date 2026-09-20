import "dotenv/config";
import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("Error connecting to mongodb: ", error);
  }
};
