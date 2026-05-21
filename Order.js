const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
});

const trackingSchema = new mongoose.Schema({
  step: { type: String },
  date: { type: String },
  done: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Processing",
    },
    tracking: [trackingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);