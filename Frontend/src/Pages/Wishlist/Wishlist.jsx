// src/Pages/Wishlist/Wishlist.jsx
import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaHeart, FaShoppingBag, FaTimes } from "react-icons/fa";
import styles from "./Wishlist.module.css";
import Footer from "../Layout/Footer/Footer";

import {
  fetchWishlist,
  removeWishlistItem,
} from "../../redux/slices/wishlistSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import Header from "../Layout/Header/Header";

// Same fallback rule as Cart: items added before the shortDescription/slug
// snapshot existed fall back to the productId, which ProductDetail already
// resolves gracefully ("Product not found") rather than breaking navigation.
const productUrl = (item) => `/product/${item.slug || item.product}`;

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
      toast.success("Add to cart");
    } catch (err) {
      toast.error(err || "Failed to Add to cart");
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
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
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.wishlistContainer}>
        <div className={styles.shippingBanner}>
          <span>✦ FREE SHIPPING ON ALL ORDERS ABOVE ₹1999 ✦</span>
        </div>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitleWrapper}>
              <FaHeart className={styles.headerIcon} />
              <h1 className={styles.headerTitle}>My Wishlist</h1>
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
                <Link to={productUrl(item)} className={styles.imageWrapper}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.productImage}
                  />
                </Link>

                <div className={styles.productDetails}>
                  <div className={styles.productHeader}>
                    <Link to={productUrl(item)} className={styles.productInfo}>
                      <h3 className={styles.productName}>{item.name}</h3>
                      {item.shortDescription && (
                        <p className={styles.productDescription}>
                          {truncateText(item.shortDescription, 100)}
                        </p>
                      )}
                    </Link>
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
                        <span className={styles.currentPrice}>
                          ₹{item.price}
                        </span>
                      </div>
                    </div>

                    <div className={styles.bottomRow}>
                      <button
                        className={styles.moveToCartSelected}
                        onClick={() => moveToCart(item)}
                      >
                        <FaShoppingBag /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        

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
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Wishlist;
