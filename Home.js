import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to RetailPro</h1>
          <p>
            Smart Online Retail Management System to manage
            products, customers, and orders efficiently.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">Shop Now</Link>
            <Link to="/register" className="btn-secondary">Get Started</Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da"
            alt="Retail"
          />
        </div>
      </section>

      {/* BUSINESS SECTION */}
      <section className="business">
        <h2>How RetailPro Helps Your Business Grow</h2>

        <div className="business-grid">
          <div className="business-card">
            <h3>🚀 Faster Operations</h3>
            <p>Automate tasks like billing and inventory.</p>
          </div>

          <div className="business-card">
            <h3>📈 Increase Sales</h3>
            <p>Track trends and boost your revenue.</p>
          </div>

          <div className="business-card">
            <h3>🤝 Better Experience</h3>
            <p>Provide smooth shopping & fast delivery.</p>
          </div>

          <div className="business-card">
            <h3>🌐 Anywhere Access</h3>
            <p>Manage your store from any device.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS + STATS */}
      <section className="reviews-section">

        <h2>What Our Users Say</h2>

        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"RetailPro made my shop management 10x easier!"</p>
            <h4>- Priya S.</h4>
          </div>

          <div className="testimonial-card">
            <p>"Smooth UI and powerful features."</p>
            <h4>- Arun K.</h4>
          </div>

          <div className="testimonial-card">
            <p>"Tracking orders is now super simple."</p>
            <h4>- Rahul M.</h4>
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-box">
            <h2>10K+</h2>
            <p>Users</p>
          </div>

          <div className="stat-box">
            <h2>50K+</h2>
            <p>Orders</p>
          </div>

          <div className="stat-box">
            <h2>99%</h2>
            <p>Satisfaction</p>
          </div>
        </div>

      </section>

      {/* SUPPORT */}
{/* SUPPORT / COMPLAINT FORM */}
<section className="support">
  <h2>Raise a Complaint</h2>
  <p>Facing any issues? Let us know and we’ll resolve it quickly.</p>

  <form className="complaint-form">
    
    <input 
      type="text" 
      placeholder="Your Name" 
      required 
    />

    <input 
      type="email" 
      placeholder="Your Email" 
      required 
    />

    <select required>
      <option value="">Select Issue Type</option>
      <option>Order Issue</option>
      <option>Payment Problem</option>
      <option>Account Issue</option>
      <option>Other</option>
    </select>

    <textarea 
      placeholder="Describe your issue..." 
      rows="4"
      required
    ></textarea>

    <button type="submit" className="btn-primary">
      Submit Complaint
    </button>

  </form>
</section>

      {/* CONTACT */}
      <section className="contact">
        <h2>Contact Us</h2>

        <p>Email: support@retailpro.com</p>
        <p>Phone: +91 98765 43210</p>
        <p>Location: Chennai, India</p>
      </section>

    </div>
  );
}

export default Home;