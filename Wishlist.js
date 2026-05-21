import React, { useState, useEffect } from "react";
import "./Wishlist.css";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toastMsg, setToastMsg] = useState("");

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Filter out any corrupted items that don't have a name
    const valid = saved.filter((item) => item && item.name && item._id);
    setWishlistItems(valid);
  }, []);

  const getImage = (productName) => {
    // Safety check — if name is undefined, return empty
    if (!productName) return "";
    const name = productName.toLowerCase();
    if (name.includes("cheese")) return "/images/cheese.webp";
    if (name.includes("egg"))    return "/images/eggs.jpeg";
    if (name.includes("rice"))   return "/images/rice.jpg";
    if (name.includes("apple"))  return "/images/apple.avif";
    if (name.includes("bread"))  return "/images/bread.jpg";
    if (name.includes("wheat"))  return "/images/wheat.jpg";
    if (name.includes("treat"))  return "/images/treat.jpg";
    return "";
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  };

  // Remove from wishlist
  const removeFromWishlist = (id) => {
    const updated = wishlistItems.filter((item) => item._id !== id);
    setWishlistItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    showToast("🗑️ Removed from wishlist");
  };

  // Add to cart
  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`✅ ${item.name} added to cart!`);
  };

  // Move to cart and remove from wishlist
  const moveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item._id);
    showToast(`🛒 ${item.name} moved to cart!`);
  };

  return (
    <div className="wishlist-container">

      <h2 className="wishlist-title">❤️ My Wishlist</h2>

      {/* Toast Notification */}
      {toastMsg && <div className="wish-toast">{toastMsg}</div>}

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <p> Your wishlist is empty.</p>
          <a href="/products" className="shop-now-btn">Shop Now</a>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item._id} className="wishlist-card">

              {/* Product Image */}
              <div className="wish-img-box">
                <img
                  src={getImage(item.name)}
                  alt={item.name}
                  className="wish-img"
                />
              </div>

              {/* Product Info */}
              <div className="wish-info">
                <p className="wish-name">{item.name}</p>
                <p className="wish-category">{item.category}</p>
                <p className="wish-price">₹{item.price}</p>
              </div>

              {/* Action Buttons */}
              <div className="wish-actions">
                <button
                  className="move-cart-btn"
                  onClick={() => moveToCart(item)}
                >
                  🛒 Move to Cart
                </button>
                <button
                  className="remove-wish-btn"
                  onClick={() => removeFromWishlist(item._id)}
                >
                  🗑️ Remove
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Wishlist;