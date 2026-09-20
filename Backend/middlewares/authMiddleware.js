import jwt from "jsonwebtoken";
import User  from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    //jwt from cookies
    const token = req.cookies.token;

    //check token exists
    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    //verify jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //find the user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    //add own data
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};


