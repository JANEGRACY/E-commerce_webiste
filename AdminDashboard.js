import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const API = "http://localhost:5000/api";

// ─── Invoice Modal ───
function InvoiceModal({ order, onClose }) {
  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content").innerHTML;
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <html><head><title>Invoice - ${order._id}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
        .inv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6c63ff; padding-bottom: 20px; margin-bottom: 20px; }
        .inv-brand { font-size: 28px; font-weight: 900; color: #6c63ff; }
        .inv-meta { text-align: right; font-size: 13px; color: #555; }
        .inv-section { margin-bottom: 20px; }
        .inv-section h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 6px; }
        .inv-section p { font-size: 14px; margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #6c63ff; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        .total-row { font-weight: 700; font-size: 15px; background: #f5f3ff; }
        .inv-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d4edda; color: #155724; }
        @media print { body { padding: 20px; } }
      </style></head><body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const subtotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + tax;
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString()
    : order.date || "N/A";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box invoice-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🧾 Invoice Preview</h3>
          <div className="modal-header-actions">
            <button className="print-btn" onClick={handlePrint}>🖨️ Print / Download</button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <div id="invoice-content" className="invoice-content">
          <div className="inv-header">
            <div>
              <div className="inv-brand">🛒 ShopAdmin</div>
              <div style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
                123, Commerce Street, Chennai<br />
                GSTIN: 27AABCU9603R1ZX
              </div>
            </div>
            <div className="inv-meta">
              <div style={{ fontSize: 22, fontWeight: 800, color: "#6c63ff" }}>INVOICE</div>
              <div><strong>Order ID:</strong> #{order._id}</div>
              <div><strong>Date:</strong> {orderDate}</div>
              <div><span className="status-badge">{order.status}</span></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 40, marginBottom: 20 }}>
            <div className="inv-section" style={{ flex: 1 }}>
              <h4>Bill To</h4>
              <p><strong>{order.customer}</strong></p>
              <p>{order.email}</p>
              <p>{order.phone}</p>
              <p>{order.address}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>₹{item.price.toLocaleString()}</td>
                  <td>₹{(item.qty * item.price).toLocaleString()}</td>
                </tr>
              ))}
              <tr><td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>Subtotal</td><td>₹{subtotal.toLocaleString()}</td></tr>
              <tr><td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>GST (18%)</td><td>₹{tax.toLocaleString()}</td></tr>
              <tr className="total-row"><td colSpan={4} style={{ textAlign: "right" }}>Grand Total</td><td>₹{grandTotal.toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div className="inv-footer">
            <p>Thank you for shopping with us! For queries, contact support@shopadmin.in</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tracking Modal ───
function TrackingModal({ order, onClose, onStatusChange }) {
  const statusColors = {
    "Processing": "#f39c12",
    "Shipped": "#3498db",
    "Out for Delivery": "#9b59b6",
    "Delivered": "#27ae60",
    "Cancelled": "#e74c3c",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box tracking-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 Order Tracking — #{order._id}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="tracking-customer-info">
          <div className="tci-item"><span>👤</span><div><strong>{order.customer}</strong><br /><small>{order.email}</small></div></div>
          <div className="tci-item"><span>📱</span><div>{order.phone}</div></div>
          <div className="tci-item"><span>📍</span><div>{order.address}</div></div>
          <div className="tci-item"><span>📅</span><div>Ordered: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}</div></div>
        </div>

        <div className="order-items-mini">
          <h4>🛍️ Items Ordered</h4>
          {order.items.map((item, i) => (
            <div key={i} className="mini-item">
              <span>{item.name} × {item.qty}</span>
              <span>₹{(item.qty * item.price).toLocaleString()}</span>
            </div>
          ))}
          <div className="mini-item total-mini">
            <span><strong>Total</strong></span>
            <span><strong>₹{order.total.toLocaleString()}</strong></span>
          </div>
        </div>

        <h4 style={{ marginBottom: 16, color: "#6c63ff" }}>🚚 Delivery Progress</h4>
        <div className="tracking-timeline">
          {order.tracking.map((step, i) => (
            <div key={i} className={`timeline-step ${step.done ? "done" : "pending"}`}>
              <div className="timeline-dot">{step.done ? "✓" : i + 1}</div>
              {i < order.tracking.length - 1 && <div className="timeline-line" />}
              <div className="timeline-info">
                <strong>{step.step}</strong>
                <small>{step.date || "Pending"}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="status-update-bar">
          <label>Update Status:</label>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order._id, e.target.value)}
            style={{ borderColor: statusColors[order.status] }}
          >
            <option>Processing</option>
            <option>Shipped</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", stock: "" });
  const [message, setMessage] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const adminName = localStorage.getItem("name") || "Admin";

  const showToast = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 2500); };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      showToast("❌ Failed to fetch products");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      showToast("❌ Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (role !== "admin") { navigate("/login"); return; }
    fetchProducts();
    fetchOrders();
  }, [role, navigate, fetchProducts, fetchOrders]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p._id !== id));
      showToast("🗑️ Product deleted!");
    } catch {
      showToast("❌ Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({ name: product.name, price: product.price, category: product.category, stock: product.stock });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await axios.put(`${API}/products/${editProduct._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("✅ Product updated!");
      } else {
        await axios.post(`${API}/products`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("✅ Product added!");
      }
      fetchProducts();
    } catch {
      showToast("❌ Server error");
    }
    setShowForm(false);
    setEditProduct(null);
    setForm({ name: "", price: "", category: "", stock: "" });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`✅ Status updated to "${newStatus}"`);
      fetchOrders();
    } catch {
      showToast("❌ Failed to update status");
    }
  };


  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const filteredOrders = orders.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (
      (o.customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o._id || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const revenue = orders
    .filter(o => o.status === "Delivered")
    .reduce((s, o) => s + o.total, 0);

  const statusColor = (s) => ({
    "Delivered": "#27ae60", "Shipped": "#3498db",
    "Processing": "#f39c12", "Cancelled": "#e74c3c", "Out for Delivery": "#9b59b6"
  }[s] || "#aaa");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 18, color: "#6c63ff" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="admin-container">

      {/* Header */}
      <div className="admin-header">
        <div className="admin-brand">🛒 <span>ShopAdmin</span></div>
        <div className="admin-tabs">
          {["products", "orders", "customers"].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab === "products" ? "📦 Products" : tab === "orders" ? "📋 Orders" : "👥 Customers"}
            </button>
          ))}
        </div>
        <div className="admin-header-right">
          <span className="admin-welcome">👋 {adminName}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card"><div className="stat-icon">📦</div><h3>{products.length}</h3><p>Products</p></div>
        <div className="stat-card"><div className="stat-icon">📋</div><h3>{orders.length}</h3><p>Total Orders</p></div>
        <div className="stat-card"><div className="stat-icon">✅</div><h3>{orders.filter(o => o.status === "Delivered").length}</h3><p>Delivered</p></div>
        <div className="stat-card"><div className="stat-icon">🚚</div><h3>{orders.filter(o => o.status === "Shipped").length}</h3><p>Shipped</p></div>
        <div className="stat-card"><div className="stat-icon">💰</div><h3>₹{revenue.toLocaleString()}</h3><p>Revenue</p></div>
        <div className="stat-card danger"><div className="stat-icon">⚠️</div><h3>{products.filter(p => p.stock === 0).length}</h3><p>Out of Stock</p></div>
      </div>

      {message && <div className="admin-toast">{message}</div>}

      {/* ── PRODUCTS TAB ── */}
      {activeTab === "products" && (
        <>
          <div className="admin-toolbar">
            <h3 className="section-title">📦 All Products</h3>
            <button className="add-product-btn" onClick={() => {
              setEditProduct(null);
              setForm({ name: "", price: "", category: "", stock: "" });
              setShowForm(true);
            }}>+ Add Product</button>
          </div>

          {showForm && (
            <div className="form-overlay">
              <div className="product-form">
                <h3>{editProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
                <form onSubmit={handleSubmit}>
                  <input type="text" placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  <input type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                  <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                  <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                  <div className="form-buttons">
                    <button type="submit" className="save-btn">{editProduct ? "Update" : "Add Product"}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td><strong>{product.name}</strong></td>
                    <td><span className="cat-tag">{product.category}</span></td>
                    <td>₹{Number(product.price).toLocaleString()}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="action-btns">
                      <button className="edit-btn" onClick={() => handleEdit(product)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(product._id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && (
        <>
          <div className="admin-toolbar">
            <h3 className="section-title">📋 All Orders</h3>
            <div className="toolbar-filters">
              <input
                className="search-input"
                placeholder="🔍 Search by name or order ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>All</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#aaa" }}>No orders found</td></tr>
                ) : filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td><strong>#{order._id}</strong></td>
                    <td>
                      <div><strong>{order.customer}</strong></div>
                      <small style={{ color: "#888" }}>{order.email}</small>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}</td>
                    <td>{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                    <td><strong>₹{order.total.toLocaleString()}</strong></td>
                    <td>
                      <span className="status-badge" style={{
                        background: statusColor(order.status) + "22",
                        color: statusColor(order.status),
                        border: `1px solid ${statusColor(order.status)}`
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="action-btns">
                      <button className="track-btn" onClick={() => setTrackingOrder(order)}>📦 Track</button>
                      <button className="invoice-btn" onClick={() => setInvoiceOrder(order)}>🧾 Invoice</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── CUSTOMERS TAB ── */}
      {activeTab === "customers" && (
        <>
          <div className="admin-toolbar">
            <h3 className="section-title">👥 Customer Overview</h3>
          </div>
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr><th>#</th><th>Customer</th><th>Contact</th><th>Address</th><th>Orders</th><th>Total Spent</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {[...new Map(orders.map(o => [o.customer, o])).values()].map((o, i) => {
                  const custOrders = orders.filter(ord => ord.customer === o.customer);
                  const spent = custOrders.reduce((s, ord) => s + ord.total, 0);
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><strong>{o.customer}</strong></td>
                      <td><div>{o.email}</div><small>{o.phone}</small></td>
                      <td style={{ maxWidth: 200, fontSize: 13 }}>{o.address}</td>
                      <td><span className="cat-tag">{custOrders.length}</span></td>
                      <td><strong>₹{spent.toLocaleString()}</strong></td>
                      <td className="action-btns">
                        <button className="track-btn" onClick={() => setTrackingOrder(custOrders[custOrders.length - 1])}>📦 Last Order</button>
                        <button className="invoice-btn" onClick={() => setInvoiceOrder(custOrders[custOrders.length - 1])}>🧾 Invoice</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {trackingOrder && (
        <TrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;