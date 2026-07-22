// src/Pages/Wishlist/Wishlist.jsx
import React, { useState } from "react";
import {
  FaHeart,
  FaStar,
  FaStarHalfAlt,
  FaShoppingBag,
  FaTrashAlt,
  FaTimes,
  FaPlus,
  FaMinus,
  FaChevronRight,
} from "react-icons/fa";
import styles from "./Wishlist.module.css";
import Contactimg from "../../assets/ContactImage.png";
import Footer from "../Layout/Footer/Footer";

const wishlistData = [
  {
    id: 1,
    name: "18k Gold Diamond Pendant",
    category: "Necklaces",
    price: 2499,
    oldPrice: 4999,
    rating: 4.8,
    reviews: 342,
    stock: "In Stock",
    image: Contactimg,
  },
  {
    id: 2,
    name: "Pearl Drop Earrings",
    category: "Earrings",
    price: 1899,
    oldPrice: 3899,
    rating: 4.9,
    reviews: 215,
    stock: "In Stock",
    image: Contactimg,
  },
  {
    id: 3,
    name: "Rose Gold Tennis Bracelet",
    category: "Bracelets",
    price: 3299,
    oldPrice: 6599,
    rating: 4.7,
    reviews: 428,
    stock: "Out of Stock",
    image: Contactimg,
  },
  {
    id: 4,
    name: "Sapphire Cocktail Ring",
    category: "Rings",
    price: 3999,
    oldPrice: 7999,
    rating: 4.9,
    reviews: 567,
    stock: "In Stock",
    image: Contactimg,
  },
];

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(wishlistData);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  const toggleSelect = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === wishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map(item => item.id));
    }
  };

  const removeItem = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const updateQuantity = (id, change) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change)
    }));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className={styles.starFilled} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className={styles.starFilled} />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className={styles.starEmpty} />);
    }
    return stars;
  };

  return (
    <div className={styles.wishlistContainer}>
      {/* Free Shipping Banner */}
      <div className={styles.shippingBanner}>
        <span>✦ FREE SHIPPING ON ALL ORDERS ABOVE ₹1999 ✦</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitleWrapper}>
            <FaHeart className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>Wishlist</h1>
          </div>
          <span className={styles.itemCount}>{wishlist.length} items</span>
        </div>
        <button className={styles.selectAllBtn} onClick={selectAll}>
          {selectedItems.length === wishlist.length && wishlist.length > 0
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      {/* Wishlist Items */}
      <div className={styles.wishlistItems}>
        {wishlist.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <FaHeart className={styles.emptyHeart} />
            <h2>Your wishlist is empty</h2>
            <p>Start adding your favourite jewellery pieces</p>
            <button className={styles.exploreBtn}>Explore Collection</button>
          </div>
        ) : (
          wishlist.map((item) => (
            <div className={styles.wishlistCard} key={item.id}>
              {/* Image */}
              <div className={styles.imageWrapper}>
                <img src={item.image} alt={item.name} className={styles.productImage} />
              </div>

              {/* Product Details */}
              <div className={styles.productDetails}>
                <div className={styles.productHeader}>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{item.name}</h3>
                    <p className={styles.productCategory}>{item.category}</p>
                    <div className={styles.ratingContainer}>
                      <span className={styles.ratingStars}>
                        {renderStars(item.rating)}
                      </span>
                      <span className={styles.ratingCount}>({item.reviews})</span>
                    </div>
                  </div>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.productBottom}>
                  <div className={styles.priceStockContainer}>
                    <div className={styles.priceContainer}>
                      <span className={styles.currentPrice}>₹{item.price}</span>
                      <span className={styles.oldPrice}>₹{item.oldPrice}</span>
                    </div>
                    <div className={styles.stockContainer}>
                      <span className={`${styles.stockStatus} ${
                        item.stock === "In Stock" ? styles.inStock : styles.outOfStock
                      }`}>
                        {item.stock}
                      </span>
                    </div>
                  </div>

                  <div className={styles.bottomRow}>
                    <div className={styles.quantityActions}>
                      <div className={styles.quantityControl}>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <FaMinus />
                        </button>
                        <span className={styles.qtyValue}>{quantities[item.id] || 1}</span>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxLabel}>Select</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      {wishlist.length > 0 && (
        <div className={styles.bottomActions}>
          <div className={styles.selectedInfo}>
            <span>{selectedItems.length} items selected</span>
            <button className={styles.moveToCartSelected}>
              <FaShoppingBag />
              Move to Cart
            </button>
          </div>
          <button className={styles.removeSelected}>
            <FaTrashAlt />
            Remove Selected
          </button>
        </div>
      )}

      {/* Trust Section */}
      <div className={styles.trustSection}>
        <div className={styles.trustCard}>
          <div className={styles.trustIconWrapper}>
            <FaHeart className={styles.trustIcon} />
          </div>
          <div className={styles.trustInfo}>
            <h4>100% Certified</h4>
            <p>Hallmarked jewellery with authenticity certificate</p>
          </div>
        </div>
        <div className={styles.trustCard}>
          <div className={styles.trustIconWrapper}>
            <FaShoppingBag className={styles.trustIcon} />
          </div>
          <div className={styles.trustInfo}>
            <h4>Free Shipping</h4>
            <p>On orders above ₹999 with express delivery</p>
          </div>
        </div>
        <div className={styles.trustCard}>
          <div className={styles.trustIconWrapper}>
            <FaTrashAlt className={styles.trustIcon} />
          </div>
          <div className={styles.trustInfo}>
            <h4>Easy Returns</h4>
            <p>30-day return policy with hassle-free process</p>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className={styles.bottomBanner}>
        <div className={styles.bannerContent}>
          <FaHeart className={styles.bannerHeart} />
          <h2 className={styles.bannerTitle}>
            Luxury Never Leaves Your Heart
          </h2>
          <p className={styles.bannerDesc}>
            Every Aurevian piece is designed to become part of your story.
            Save it today and own it tomorrow.
          </p>
          <button className={styles.bannerBtn}>
            Continue Shopping <FaChevronRight />
          </button>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Wishlist;