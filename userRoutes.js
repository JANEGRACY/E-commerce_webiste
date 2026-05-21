const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ─────────────────────────────
// ✅ REGISTER USER
// ─────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "user", // default role
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────
// ✅ LOGIN USER (ADMIN / DELIVERY / USER)
// ─────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔐 Compare hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔑 Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────
// 🚚 CREATE DELIVERY USER (TEMP ROUTE)
// ─────────────────────────────
router.post("/create-delivery", async (req, res) => {
  try {
    const existing = await User.findOne({ email: "delivery@gmail.com" });
    if (existing) {
      return res.json({ message: "Delivery user already exists" });
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = new User({
      name: "Delivery Boy",
      email: "delivery@gmail.com",
      password: hashedPassword,
      role: "delivery",
    });

    await user.save();

    res.json({
      message: "✅ Delivery user created successfully",
      email: "delivery@gmail.com",
      password: "123456",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─────────────────────────────
module.exports = router;