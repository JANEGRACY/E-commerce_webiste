import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [cartMessage, setCartMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));

    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist.map((item) => item._id));
  }, []);

  const getImage = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes("cheese")) return "/images/cheese.webp";
    if (name.includes("egg"))    return "/images/eggs.jpeg";
    if (name.includes("rice"))   return "/images/rice.jpg";
    if (name.includes("apple"))  return "/images/apple.avif";
    if (name.includes("bread"))  return "/images/bread.jpg";
    if (name.includes("wheat"))  return "/images/wheat.jpg";
    if (name.includes("treat"))  return "/images/treat.jpg";
    if (name.includes("banana")) return "/images/banana.jpg";
    return "";
  };

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  // ── Add to Cart ──
  const addToCart = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartMessage("⚠️ Please login to add items to cart!");
      setTimeout(() => setCartMessage(""), 2500);
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartMessage(`✅ ${product.name} added to cart!`);
    setTimeout(() => setCartMessage(""), 2000);
  };

  // ── Remove from Cart ──
  const removeFromCart = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartMessage("⚠️ Please login first!");
      setTimeout(() => setCartMessage(""), 2500);
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      if (existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        cart.splice(cart.indexOf(existing), 1);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      setCartMessage(`➖ ${product.name} removed one`);
      setTimeout(() => setCartMessage(""), 2000);
    }
  };

  // ── Toggle Wishlist ──
  const toggleWishlist = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartMessage("⚠️ Please login to add to wishlist!");
      setTimeout(() => setCartMessage(""), 2500);
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = saved.find((item) => item._id === product._id);

    let updated;
    if (exists) {
      updated = saved.filter((item) => item._id !== product._id);
    } else {
      updated = [...saved, product];
    }

    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated.map((item) => item._id));
  };

  return (
    <div className="main-container">

      <h2 className="title">Products</h2>

      {/* Search Bar */}
      <div className="search-filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category Filter */}
        <div className="filter-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Wishlist Message Toast */}
      {cartMessage && (
        <div className="cart-toast">{cartMessage}</div>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <p className="no-results">No products found.</p>
      )}

      {/* Product Grid */}
      <div className="product-row">
        {filteredProducts.map((product) => (
          <div key={product._id} className="card">

            {/* Wishlist Button */}
            <button
              className={`wishlist-btn ${wishlist.includes(product._id) ? "wishlisted" : ""}`}
              onClick={() => toggleWishlist(product)}
              title="Add to Wishlist"
            >
              {wishlist.includes(product._id) ? "❤️" : "🤍"}
            </button>

            {/* Product Image */}
            <div className="image-box">
              <img
                src={getImage(product.name)}
                alt={product.name}
                className="product-img"
              />
            </div>

            {/* Product Name */}
            <p className="product-name">{product.name}</p>

            {/* Product Price */}
            <div className="price-section">
              <span className="price">₹{product.price}</span>
            </div>

            {/* + / Add to Cart / - Buttons */}
            <div className="card-qty-controls">
              <button
                className="card-qty-btn"
                onClick={() => removeFromCart(product)}
              >
                −
              </button>

              <button
                className="cart-btn"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>

              <button
                className="card-qty-btn"
                onClick={() => addToCart(product)}
              >
                +
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ProductList;