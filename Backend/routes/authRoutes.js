import  express from "express";

import  { signup, login, logout, getMe } from  "../controllers/authController.js";
import {protect} from "../middlewares/authMiddleware.js";
const router = express.Router();

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);

//getme
router.get("/me", protect , getMe);

export default router;
