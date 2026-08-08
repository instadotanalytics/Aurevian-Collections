// src/Pages/Wishlist/Wishlist.jsx
import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaHeart, FaShoppingBag, FaTrashAlt, FaTimes } from "react-icons/fa";
import styles from "./Wishlist.module.css";
import Footer from "../Layout/Footer/Footer";

import {
  fetchWishlist,
  removeWishlistItem,
} from "../../redux/slices/wishlistSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: wishlist, isLoading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const removeItem = (productId) => {
    dispatch(removeWishlistItem(productId));
    toast.success("Removed from wishlist");
  };

  const moveToCart = async (item) => {
    try {
      await dispatch(
        addItemToCart({ productId: item.product, quantity: 1 }),
      ).unwrap();
      dispatch(removeWishlistItem(item.product));
      toast.success("Moved to cart");
    } catch (err) {
      toast.error(err || "Failed to move to cart");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.emptyWishlist}>
          <FaHeart className={styles.emptyHeart} />
          <h2>Please login to view your wishlist</h2>
          <Link to="/login" className={styles.exploreBtn}>
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.wishlistContainer}>
      <div className={styles.shippingBanner}>
        <span>✦ FREE SHIPPING ON ALL ORDERS ABOVE ₹1999 ✦</span>
      </div>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitleWrapper}>
            <FaHeart className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>Wishlist</h1>
          </div>
          <span className={styles.itemCount}>{wishlist.length} items</span>
        </div>
      </div>

      <div className={styles.wishlistItems}>
        {!isLoading && wishlist.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <FaHeart className={styles.emptyHeart} />
            <h2>Your wishlist is empty</h2>
            <p>Start adding your favourite jewellery pieces</p>
            <Link to="/" className={styles.exploreBtn}>
              Explore Collection
            </Link>
          </div>
        ) : (
          wishlist.map((item) => (
            <div className={styles.wishlistCard} key={item.product}>
              <div className={styles.imageWrapper}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.productImage}
                />
              </div>

              <div className={styles.productDetails}>
                <div className={styles.productHeader}>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{item.name}</h3>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.product)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.productBottom}>
                  <div className={styles.priceStockContainer}>
                    <div className={styles.priceContainer}>
                      <span className={styles.currentPrice}>₹{item.price}</span>
                    </div>
                  </div>

                  <div className={styles.bottomRow}>
                    <button
                      className={styles.moveToCartSelected}
                      onClick={() => moveToCart(item)}
                    >
                      <FaShoppingBag /> Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {wishlist.length > 0 && (
        <div className={styles.bottomActions}>
          <span>{wishlist.length} items in wishlist</span>
        </div>
      )}

      <div className={styles.bottomBanner}>
        <div className={styles.bannerContent}>
          <FaHeart className={styles.bannerHeart} />
          <h2 className={styles.bannerTitle}>Luxury Never Leaves Your Heart</h2>
          <p className={styles.bannerDesc}>
            Every Aurevian piece is designed to become part of your story. Save
            it today and own it tomorrow.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
