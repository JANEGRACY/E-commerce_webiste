const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");

// ── Verify Delivery Partner ──
const verifyDelivery = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    if (decoded.role !== "delivery" && decoded.role !== "admin")
      return res.status(403).json({ message: "Delivery partners only" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── GET all orders (delivery partner sees all) ──
router.get("/orders", verifyDelivery, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT update order status ──
router.put("/orders/:id/status", verifyDelivery, async (req, res) => {
  try {
    const { status } = req.body;

const trackingStepMap = {
  "Processing": 1,
  "Shipped": 2,
  "Out for Delivery": 3,
  "Delivered": 4,
};
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    const stepIndex = trackingStepMap[status];
    if (stepIndex !== undefined) {
      for (let i = 0; i <= stepIndex; i++) {
        if (!order.tracking[i].done) {
          order.tracking[i].done = true;
          order.tracking[i].date = new Date().toLocaleString();
        }
      }
    }

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;