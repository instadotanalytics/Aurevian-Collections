// src/Pages/Layout/ProductDetail/RelevantProducts.jsx
//
// Self-contained: fetches its own data keyed on `productId`, manages its
// own cart/wishlist interactions independently of the parent product's
// quantity/addedToCart state. Renders null on empty result or error, so
// a slow/failed relevant-products call never blocks or breaks the rest
// of the product page (product info above renders regardless).

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHeart, FiShoppingBag, FiCheck } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import styles from "./RelevantProducts.module.css";

import {
  fetchRelevantProducts,
  clearRelevantProducts,
} from "../../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../../redux/slices/cartSlice";
import { toggleWishlistItem } from "../../../redux/slices/wishlistSlice";

function RelevantSkeletonCard() {
  return (
    <div className={styles.relevantCard}>
      <div className={`${styles.relevantImageWrap} ${styles.shimmer}`} />
      <div className={styles.relevantBody}>
        <div
          className={styles.shimmer}
          style={{ height: 14, width: "80%", borderRadius: 4 }}
        />
        <div
          className={styles.shimmer}
          style={{ height: 16, width: "40%", borderRadius: 4, marginTop: 6 }}
        />
      </div>
    </div>
  );
}

export default function RelevantProducts({ productId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { relevantProducts } = useSelector((state) => state.storefrontProduct);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [cartLoadingId, setCartLoadingId] = useState(null);

  // ✅ Refetches whenever productId changes — this is what makes the
  // section update on in-app navigation from Product A to Product B
  // (Test 5) without a full page reload. Cleanup clears state on every
  // id change (including the brief moment it's undefined while a new
  // slug is loading), so Product A's recommendations never linger
  // while Product B's are being fetched.
  useEffect(() => {
    if (productId) {
      dispatch(fetchRelevantProducts({ productId, limit: 8 }));
    }
    return () => {
      dispatch(clearRelevantProducts());
    };
  }, [dispatch, productId]);

  const { products, isLoading, error } = relevantProducts;

  // Empty result, error, or nothing to show yet and not loading —
  // hide the section rather than render an empty/broken shell (Test 3).
  if (!isLoading && (error || products.length === 0)) {
    return null;
  }

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: window.location.pathname } });
      return false;
    }
    return true;
  };

  const isInCart = (id) => cartItems.some((i) => i.product === id);
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.product?._id || i.product) === id);

  const handleToggleWishlist = (id) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(id)).catch(() => {});
  };

  const handleAddToCart = async (id) => {
    if (!requireAuth()) return;
    try {
      setCartLoadingId(id);
      await dispatch(addItemToCart({ productId: id, quantity: 1 })).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setCartLoadingId(null);
    }
  };

  const items = isLoading
    ? Array.from({ length: 4 }, (_, i) => ({ _skeletonId: i }))
    : products;

  return (
    <section
      className={styles.relevantSection}
      aria-labelledby="relevant-products-heading"
    >
      <h2 id="relevant-products-heading" className={styles.relevantTitle}>
        You May Also Like
      </h2>

      <div className={styles.relevantGrid}>
        {isLoading
          ? items.map((item) => <RelevantSkeletonCard key={item._skeletonId} />)
          : items.map((p) => {
              const displayPrice =
                p.pricing?.salePrice || p.pricing?.originalPrice;
              const hasDiscount =
                p.pricing?.salePrice &&
                p.pricing?.salePrice < p.pricing?.originalPrice;
              const inCart = isInCart(p._id);
              const inWishlist = isInWishlist(p._id);
              const addingToCart = cartLoadingId === p._id;

              return (
                <div className={styles.relevantCard} key={p._id}>
                  <Link
                    to={`/product/${p.productSlug}`}
                    className={styles.relevantImageWrap}
                  >
                    <img
                      src={p.thumbnail?.url || "/placeholder-image.jpg"}
                      alt={p.productName}
                      className={styles.relevantImage}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <button
                      type="button"
                      className={`${styles.relevantWishlistBtn} ${
                        inWishlist ? styles.relevantWishlistBtnActive : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleWishlist(p._id);
                      }}
                      aria-label={
                        inWishlist ? "Remove from wishlist" : "Add to wishlist"
                      }
                    >
                      {inWishlist ? <FaHeart /> : <FiHeart />}
                    </button>
                  </Link>

                  <div className={styles.relevantBody}>
                    <Link
                      to={`/product/${p.productSlug}`}
                      className={styles.relevantName}
                      title={p.productName}
                    >
                      {p.productName}
                    </Link>
                    <div className={styles.relevantPriceRow}>
                      <span className={styles.relevantPrice}>
                        ₹{displayPrice?.toLocaleString() || "0"}
                      </span>
                      {hasDiscount && (
                        <span className={styles.relevantOldPrice}>
                          ₹{p.pricing.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`${styles.relevantCartBtn} ${
                        inCart ? styles.relevantCartBtnActive : ""
                      }`}
                      onClick={() => handleAddToCart(p._id)}
                      disabled={inCart || addingToCart}
                    >
                      {inCart ? (
                        <>
                          <FiCheck /> Added
                        </>
                      ) : (
                        <>
                          <FiShoppingBag />{" "}
                          {addingToCart ? "Adding..." : "Add to Cart"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
}
