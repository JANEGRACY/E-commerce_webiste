import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import ProductList from "./components/ProductList";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import "./App.css";

// ── Navbar separated so useNavigate works inside Router ──
function Navbar({ onLogout }) {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  return (
    <nav className="navbar">
      <div className="logo">Jane RetailPro</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/cart"> Cart</Link></li>
        <li><Link to="/wishlist"> Wishlist</Link></li>
        {token ? (
          <>
            <li className="nav-username">Hi {name}</li>
            <li>
              <button className="logout-nav-btn" onClick={onLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

function AppContent() {
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    forceUpdate(n => n + 1); // re-render navbar
    navigate("/login");
  };

  return (
    <div className="app">

      {/* Navbar only for non-admin */}
      {role !== "admin" && <Navbar onLogout={handleLogout} />}

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />
        </Routes>
      </div>

      {role !== "admin" && (
        <footer className="footer">
          © jane RetailPro | contact: 7845072426 | email: janegracy2005@gmail.com
        </footer>
      )}

    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;