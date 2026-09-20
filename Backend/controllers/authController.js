import User from"../models/User.js";
import bcrypt from "bcryptjs";
import jwt from"jsonwebtoken";


//SIGNUP
export const signup = async (req,res)=>{
    try {
      //backend receive the data
      const { name, email, password } = req.body;

      //missing fields
      if (!name || !email || !password) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      //password length
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      //user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      //hashed password
      const hashedPassword = await bcrypt.hash(password, 10);

      //user created
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      //jwt is created
      const generateToken = (userId) => {
        return jwt.sign({ userId }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
      };

      const token = generateToken(user._id);

      //cookies
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      //response
      res.status(201).json({
        message: "Signup successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      res.status(500).json({
        message: error.message,
      });
    }
};





// LOGIN
export const login = async (req, res) => {
  try {
    //backend receive data
    const { email, password } = req.body;

    //missing fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    //find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    //compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const generateToken = (userId) => {
      return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
    };

    //create jwt
    const token = generateToken(user._id);

    //send a cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //response the user
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGOUT
//clear cookies 
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
//logout response
  res.status(200).json({
    message: "Logout successful",
  });
};


//getme
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

