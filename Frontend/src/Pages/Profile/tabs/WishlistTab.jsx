// src/Pages/Profile/tabs/WishlistTab.jsx

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiHeart,
  FiShoppingBag,
  FiTrash2,
  FiStar,
  FiStar as FiStarFilled,
  FiShoppingCart,
  FiInfo,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { removeWishlist } from "../../../redux/slices/profileSlice";
import styles from "../Profile.module.css";

const WishlistTab = () => {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((state) => state.profile);
  const [addingToCart, setAddingToCart] = useState(null);

  const removeFromWishlist = async (productId) => {
    try {
      await dispatch(removeWishlist(productId)).unwrap();
    } catch (error) {
      // Error handled in slice
    }
  };

  const addToCart = async (product) => {
    setAddingToCart(product._id);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Added to cart!");
      } else {
        toast.error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (product) => {
    await addToCart(product);
    // Navigate to checkout
    // navigate('/checkout');
  };

  const handleViewProduct = (productId) => {
    toast.info("Product page coming soon");
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStarFilled key={`star-${i}`} className={styles.starFilled} />,
      );
    }
    if (hasHalfStar) {
      stars.push(<FiStarFilled key="half-star" className={styles.starHalf} />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className={styles.starEmpty} />);
    }
    return stars;
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { label: "In Stock", className: styles.inStock };
    if (stock > 0) return { label: "Low Stock", className: styles.lowStock };
    return { label: "Out of Stock", className: styles.outOfStock };
  };

  const getDiscountBadge = (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice)
      return null;
    const discount = Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
    return <span className={styles.discountBadge}>{discount}% OFF</span>;
  };

  if (loading) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.emptyState}>
          <FiHeart size={48} />
          <h3>Your wishlist is empty</h3>
          <p>Save your favorite items here</p>
          <button className={styles.shopBtn}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>My Wishlist</h2>
        <span className={styles.wishlistCount}>{wishlist.length} items</span>
      </div>

      <div className={styles.wishlistGrid}>
        {wishlist.map((item) => {
          const product = item.product || item;
          const stockStatus = getStockStatus(
            product.stock || product.quantity || 0,
          );
          const discountBadge = getDiscountBadge(
            product.originalPrice || product.mrp,
            product.price,
          );

          return (
            <div key={item._id || product._id} className={styles.wishlistCard}>
              <div className={styles.wishlistImageContainer}>
                <img
                  src={
                    product.images?.[0]?.url ||
                    product.image ||
                    "/placeholder.jpg"
                  }
                  alt={product.name}
                  className={styles.wishlistImage}
                  onClick={() => handleViewProduct(product._id)}
                />
                <button
                  className={styles.wishlistRemoveBtn}
                  onClick={() => removeFromWishlist(product._id)}
                  disabled={loading}
                  aria-label="Remove from wishlist"
                >
                  <FiTrash2 size={16} />
                </button>
                {discountBadge}
                {product.isNew && <span className={styles.newBadge}>New</span>}
              </div>

              <div className={styles.wishlistInfo}>
                <h3
                  className={styles.wishlistName}
                  onClick={() => handleViewProduct(product._id)}
                >
                  {product.name}
                </h3>

                <div className={styles.wishlistRating}>
                  {renderStars(product.rating)}
                  <span className={styles.ratingCount}>
                    ({product.reviewCount || 0})
                  </span>
                </div>

                <div className={styles.wishlistPriceSection}>
                  <div className={styles.wishlistPrices}>
                    <span className={styles.wishlistPrice}>
                      ₹{product.price?.toFixed(2)}
                    </span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className={styles.wishlistOriginalPrice}>
                          ₹{product.originalPrice?.toFixed(2)}
                        </span>
                      )}
                  </div>
                  <span
                    className={`${styles.stockStatus} ${stockStatus.className}`}
                  >
                    {stockStatus.label}
                  </span>
                </div>

                <div className={styles.wishlistActions}>
                  <button
                    className={styles.wishlistCartBtn}
                    onClick={() => addToCart(product)}
                    disabled={
                      addingToCart === product._id ||
                      stockStatus.className === styles.outOfStock
                    }
                  >
                    {addingToCart === product._id ? (
                      "Adding..."
                    ) : (
                      <>
                        <FiShoppingCart size={16} />
                        {stockStatus.className === styles.outOfStock
                          ? "Out of Stock"
                          : "Move to Cart"}
                      </>
                    )}
                  </button>
                  <button
                    className={styles.wishlistBuyBtn}
                    onClick={() => handleBuyNow(product)}
                    disabled={stockStatus.className === styles.outOfStock}
                  >
                    Buy Now
                  </button>
                  <button
                    className={styles.wishlistViewBtn}
                    onClick={() => handleViewProduct(product._id)}
                  >
                    <FiInfo size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistTab;
