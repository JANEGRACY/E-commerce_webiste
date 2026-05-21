const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// ── Inline admin verify ──
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Admins only" });

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── GET all orders (Admin only) ──
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET single order ──
router.get("/:id", verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── CREATE ORDER ──
router.post("/", async (req, res) => {
  try {
    const { customer, email, phone, address, items, total } = req.body;

    const tracking = [
      { step: "Order Placed", date: new Date().toLocaleString(), done: true },
      { step: "Payment Confirmed", date: new Date().toLocaleString(), done: true },
      { step: "Packed", date: "", done: false },
      { step: "Shipped", date: "", done: false },
      { step: "Out for Delivery", date: "", done: false },
      { step: "Delivered", date: "", done: false },
    ];

    const newOrder = new Order({
      customer,
      email,
      phone,
      address,
      items,
      total,
      tracking,
    });

    const saved = await newOrder.save();

    // ✅ 📧 IMPROVED ORDER CONFIRMATION EMAIL
    const itemsList = saved.items
      .map(item => `• ${item.name} (x${item.qty}) - ₹${item.price}`)
      .join("\n");

    await sendEmail(
      saved.email,
      "🛒 Order Confirmed - RetailPro",
      `Hello ${saved.customer},

🎉 Your order has been placed successfully!

━━━━━━━━━━━━━━━━━━━━━━
🆔 Order ID: ${saved._id}

🛍️ Items:
${itemsList}

💰 Total Amount: ₹${saved.total}

📦 Status: Order Placed
━━━━━━━━━━━━━━━━━━━━━━

📍 Address:
${saved.address}

📞 Phone: ${saved.phone}

We are preparing your order and will notify you once it is shipped 🚚

Thank you for shopping with RetailPro ❤️

- Team RetailPro`
    );

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({
      message: "Failed to create order",
      error: err.message,
    });
  }
});

// ── UPDATE STATUS ──
router.put("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const trackingStepMap = {
      "Packed": 2,
      "Shipped": 3,
      "Out for Delivery": 4,
      "Delivered": 5,
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

    // ✅ 📧 IMPROVED SHIPPED EMAIL
    if (status === "Shipped") {
      await sendEmail(
        order.email,
        "📦 Your Order is Shipped!",
        `
        <h2>🛒 RetailPro</h2>
        <p>Hi <b>${order.customer}</b>,</p>

        <p>Your order has been <b>Shipped</b> 🚚</p>

        <p><b>Order ID:</b> ${order._id}</p>
        <p><b>Total:</b> ₹${order.total}</p>

        <p>📦 It will reach you soon!</p>

        <br/>
        <p>❤️ Thank you for shopping with us</p>
        `
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update status",
      error: err.message,
    });
  }
});

// ── DELETE ORDER ──
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete order",
      error: err.message,
    });
  }
});

module.exports = router;