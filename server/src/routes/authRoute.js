import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    console.log("Auth signup request body:", req.body);
    // If DB isn't connected, fail fast with a clear message (dev-friendly)
    if (mongoose.connection.readyState !== 1) {
      console.error("Signup attempted but MongoDB is not connected (readyState=", mongoose.connection.readyState, ")");
      return res.status(503).json({ error: "db_unavailable", message: "Database not connected" });
    }
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "missing_fields", message: "name, email and password are required" });
      }

    const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "user_exists", message: "Email already in use" });
      }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
      if (err && err.code === 11000) {
        return res.status(409).json({ error: "user_exists", message: "Email already in use" });
      }
      res.status(500).json({ error: "Signup failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    console.log("Auth login request body:", req.body);
    if (mongoose.connection.readyState !== 1) {
      console.error("Login attempted but MongoDB is not connected (readyState=", mongoose.connection.readyState, ")");
      return res.status(503).json({ error: "db_unavailable", message: "Database not connected" });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

      if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
  }
});

export default router;
