import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { dbConnect } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//cors
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//middleware
app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

import cors from "cors";



app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Todo API is running",
  });
});


app.listen(PORT, () => {
  dbConnect();
  console.log("Server is running on port: ", PORT);
});