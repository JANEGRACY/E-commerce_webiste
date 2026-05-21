import React, { useEffect, useState } from "react";
import axios from "axios";

function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  // ── Fetch Orders ──
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/delivery/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(res.data);
    } catch (err) {
      console.log("Error fetching orders:", err);
    }
  };

  // ── Load on page start ──
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // ── Update Status ──
  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/delivery/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchOrders(); // refresh after update
    } catch (err) {
      console.log("Error updating status:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚚 Delivery Dashboard</h2>

      {orders.length === 0 ? (
        <p>No orders available</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              margin: "10px 0",
              borderRadius: "8px",
            }}
          >
            <p><b>Order ID:</b> {order._id}</p>
            <p><b>Customer:</b> {order.customer}</p>
            <p><b>Address:</b> {order.address}</p>
            <p><b>Status:</b> {order.status}</p>

            <label>Update Status: </label>
            <select
              value={order.status}
              onChange={(e) =>
                updateStatus(order._id, e.target.value)
              }
            >
              <option>Processing</option>
              <option>Shipped</option>
              <option>Out for Delivery</option>
              <option>Delivered</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}

export default DeliveryDashboard;