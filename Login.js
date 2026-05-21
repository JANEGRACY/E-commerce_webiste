import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

localStorage.setItem("token", res.data.token);
localStorage.setItem("role", res.data.role);
localStorage.setItem("name", res.data.name);
localStorage.setItem("email", res.data.email);  // ← add this line

     if (res.data.role === "admin") {
  navigate("/admin");
} else if (res.data.role === "delivery") {
  navigate("/delivery");   // ← add this
} else {
  navigate("/products");
}
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">

      {/* Left Side */}
      <div className="login-left">
        <h1>RetailPro</h1>
        <p>Your one-stop shop for all essentials.</p>
        <p>Login to continue shopping or manage your store.</p>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="login-form">

          <h2>Welcome Back 👋</h2>
          <p className="login-sub">Login to your RetailPro account</p>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <a href="/register">Register</a></p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;