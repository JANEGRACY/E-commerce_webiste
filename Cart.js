import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Cart.css";

const API = "http://localhost:5000/api";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
 
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTracking, setShowTracking] = useState(false);
  

  const [form, setForm] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(saved);
  }, []);

  const increase = (id) => {
    const updated = cartItems.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const decrease = (id) => {
    const updated = cartItems
      .map((item) =>
        item._id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = {
        customer: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        items: cartItems.map((item) => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        total,
      };

      const res = await axios.post(`${API}/orders`, data);
     
      setOrderData(res.data); // ← save full order for tracking & invoice
      localStorage.removeItem("cart");
      setCartItems([]);
      setShowCheckout(false);
      setOrderPlaced(true);
    } catch (err) {
      setError("❌ Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Print Invoice ──
  const handlePrintInvoice = () => {
    if (!orderData) return;
    const subtotal = orderData.items.reduce((s, i) => s + i.qty * i.price, 0);
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + tax;
    const date = new Date(orderData.createdAt).toLocaleDateString();

    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <html><head><title>Invoice - ${orderData._id}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
        .inv-header { display: flex; justify-content: space-between; border-bottom: 3px solid #1a2e5a; padding-bottom: 20px; margin-bottom: 20px; }
        .brand { font-size: 26px; font-weight: 900; color: #1a2e5a; }
        .meta { text-align: right; font-size: 13px; color: #555; line-height: 1.8; }
        .invoice-title { font-size: 22px; font-weight: 800; color: #1a2e5a; }
        .bill-section { margin-bottom: 20px; }
        .bill-section h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 6px; }
        .bill-section p { font-size: 14px; margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #1a2e5a; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
        td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
        .total-row { background: #e8eaf6; font-weight: 700; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d4edda; color: #155724; }
        @media print { body { padding: 20px; } }
      </style></head>
      <body>
        <div class="inv-header">
          <div>
            <div class="brand">🛒 RetailPro</div>
            <div style="font-size:13px;color:#777;margin-top:4px">
              123, Commerce Street, Chennai<br/>GSTIN: 27AABCU9603R1ZX
            </div>
          </div>
          <div class="meta">
            <div class="invoice-title">INVOICE</div>
            <div><strong>Order ID:</strong> #${orderData._id}</div>
            <div><strong>Date:</strong> ${date}</div>
            <div><span class="badge">${orderData.status}</span></div>
          </div>
        </div>
        <div class="bill-section">
          <h4>Bill To</h4>
          <p><strong>${orderData.customer}</strong></p>
          <p>${orderData.email}</p>
          <p>${orderData.phone}</p>
          <p>${orderData.address}</p>
        </div>
        <table>
          <thead>
            <tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${orderData.items.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.price.toLocaleString()}</td>
                <td>₹${(item.qty * item.price).toLocaleString()}</td>
              </tr>
            `).join("")}
            <tr><td colspan="4" style="text-align:right;font-weight:600">Subtotal</td><td>₹${subtotal.toLocaleString()}</td></tr>
            <tr><td colspan="4" style="text-align:right;font-weight:600">GST (18%)</td><td>₹${tax.toLocaleString()}</td></tr>
            <tr class="total-row"><td colspan="4" style="text-align:right">Grand Total</td><td>₹${grandTotal.toLocaleString()}</td></tr>
          </tbody>
        </table>
        <div class="footer">
          <p>Thank you for shopping with RetailPro!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // ── Order Success Screen ──
  if (orderPlaced && orderData) {
    const statusColors = {
      "Processing": "#f39c12",
      "Shipped": "#3498db",
      "Out for Delivery": "#9b59b6",
      "Delivered": "#27ae60",
      "Cancelled": "#e74c3c",
    };

    return (
      <div className="cart-container">
        <div className="order-success">
          <div className="success-icon">🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you <strong>{orderData.customer}</strong>! Your order has been received.</p>
          <p className="success-sub">Order ID: <strong>#{orderData._id}</strong></p>
          <p className="success-sub">
            Confirmation will be sent to <strong>{orderData.email}</strong>
          </p>

          {/* Action Buttons */}
          <div className="success-actions">
            <button className="track-order-btn" onClick={() => setShowTracking(!showTracking)}>
              {showTracking ? "Hide Tracking" : "📦 Track My Order"}
            </button>
            <button className="invoice-download-btn" onClick={handlePrintInvoice}>
              🧾 Download Invoice
            </button>
          </div>

          {/* ── Tracking Section ── */}
          {showTracking && (
            <div className="user-tracking">
              <h3>🚚 Delivery Status</h3>

              {/* Status Badge */}
              <div className="user-status-badge" style={{
                background: (statusColors[orderData.status] || "#aaa") + "22",
                color: statusColors[orderData.status] || "#aaa",
                border: `1px solid ${statusColors[orderData.status] || "#aaa"}`
              }}>
                {orderData.status}
              </div>

              {/* Customer Info */}
              <div className="user-order-info">
                <div className="uoi-row"><span>👤</span><span>{orderData.customer}</span></div>
                <div className="uoi-row"><span>📱</span><span>{orderData.phone}</span></div>
                <div className="uoi-row"><span>📍</span><span>{orderData.address}</span></div>
                <div className="uoi-row"><span>📅</span><span>{new Date(orderData.createdAt).toLocaleDateString()}</span></div>
              </div>

              {/* Items */}
              <div className="user-items">
                <p className="ui-title">Items Ordered</p>
                {orderData.items.map((item, i) => (
                  <div key={i} className="ui-row">
                    <span>{item.name} × {item.qty}</span>
                    <span>₹{(item.qty * item.price).toLocaleString()}</span>
                  </div>
                ))}
                <div className="ui-row ui-total">
                  <span>Total</span>
                  <span>₹{orderData.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="user-timeline">
                {orderData.tracking.map((step, i) => (
                  <div key={i} className={`ut-step ${step.done ? "done" : "pending"}`}>
                    <div className="ut-dot">{step.done ? "✓" : i + 1}</div>
                    {i < orderData.tracking.length - 1 && <div className="ut-line" />}
                    <div className="ut-info">
                      <strong>{step.step}</strong>
                      <small>{step.date || "Pending"}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="checkout-btn"
            style={{ marginTop: 24 }}
            onClick={() => (window.location.href = "/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="empty-cart">No items in cart.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-card">
                <div className="cart-info">
                  <p className="cart-name">{item.name}</p>
                  <p className="cart-price">₹{item.price} each</p>
                </div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => decrease(item._id)}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => increase(item._id)}>+</button>
                </div>
                <p className="item-total">₹{item.price * item.quantity}</p>
                <button className="remove-btn" onClick={() => removeItem(item._id)}>🗑️</button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <span>Total:</span>
            <span className="total-price">₹{total.toLocaleString()}</span>
          </div>

          <button className="checkout-btn" onClick={() => setShowCheckout(true)}>
            Proceed to Checkout
          </button>
        </>
      )}

      {/* ── Checkout Modal ── */}
      {showCheckout && (
        <div className="checkout-overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <h3>📦 Complete Your Order</h3>
              <button className="co-close-btn" onClick={() => setShowCheckout(false)}>✕</button>
            </div>

            <div className="co-summary">
              <p className="co-summary-title">Order Summary</p>
              {cartItems.map((item, i) => (
                <div key={i} className="co-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="co-item co-total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="co-form">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
              />
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
              <label>Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
              <label>Delivery Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House no, Street, City, State - PIN"
                rows={3}
                required
              />
              {error && <p className="co-error">{error}</p>}
              <button type="submit" className="co-place-btn" disabled={loading}>
                {loading ? "Placing Order..." : "✅ Place Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;