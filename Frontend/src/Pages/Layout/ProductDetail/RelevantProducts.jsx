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
      <div className={styles.relevantImageWrap}>
        <div className={styles.skeletonImage} />
      </div>
      <div className={styles.relevantBody}>
        <div className={styles.skeletonText} />
        <div className={`${styles.skeletonText} ${styles.skeletonTextShort}`} />
        <div className={styles.skeletonBtn} />
      </div>
    </div>
  );
}

export default function RelevantProducts({ productId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const relevantProductsState = useSelector(
    (state) => state.storefrontProduct?.relevantProducts,
  );

  const {
    products = [],
    isLoading = false,
    error = null,
  } = relevantProductsState || {};

  const { isAuthenticated } = useSelector((state) => state.auth || {});

  const cartItems = useSelector((state) => state.cart?.items || []);

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [cartLoadingId, setCartLoadingId] = useState(null);

  useEffect(() => {
    if (!productId) {
      dispatch(clearRelevantProducts());
      return;
    }

    dispatch(clearRelevantProducts());

    dispatch(
      fetchRelevantProducts({
        productId,
        limit: 6,
      }),
    );
  }, [dispatch, productId]);

  if (!isLoading && (error || products.length === 0)) {
    return null;
  }

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", {
        state: {
          from: window.location.pathname,
        },
      });
      return false;
    }
    return true;
  };

  const isInCart = (id) => {
    return cartItems.some(
      (item) => item.product === id || item.product?._id === id,
    );
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(
      (item) => (item.product?._id || item.product) === id,
    );
  };

  const handleToggleWishlist = (id) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(id)).catch(() => {});
  };

  const handleAddToCart = async (id) => {
    if (!requireAuth()) return;

    try {
      setCartLoadingId(id);
      await dispatch(
        addItemToCart({
          productId: id,
          quantity: 1,
        }),
      ).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setCartLoadingId(null);
    }
  };

  const items = isLoading
    ? Array.from({ length: 6 }, (_, index) => ({
        _skeletonId: index,
      }))
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
                p.pricing?.salePrice || p.pricing?.originalPrice || 0;

              const hasDiscount =
                p.pricing?.salePrice &&
                p.pricing?.originalPrice &&
                p.pricing.salePrice < p.pricing.originalPrice;

              const discount = hasDiscount
                ? Math.round(
                    ((p.pricing.originalPrice - p.pricing.salePrice) /
                      p.pricing.originalPrice) *
                      100
                  )
                : 0;

              const inCart = isInCart(p._id);
              const inWishlist = isInWishlist(p._id);
              const addingToCart = cartLoadingId === p._id;

              const productUrl = p.productSlug
                ? `/product/${p.productSlug}`
                : `/product/${p._id}`;

              return (
                <div className={styles.relevantCard} key={p._id}>
                  <Link to={productUrl} className={styles.relevantImageWrap}>
                    <img
                      src={p.thumbnail?.url || "/placeholder-image.jpg"}
                      alt={p.productName || "Recommended product"}
                      className={styles.relevantImage}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                      }}
                    />

                    {discount > 0 && (
                      <span className={styles.relevantDiscount}>
                        {discount}% OFF
                      </span>
                    )}

                    <span className={styles.relevantCategoryOverlay}>
                      {p.category?.categoryData?.label || "Uncategorized"}
                    </span>

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
                      to={productUrl}
                      className={styles.relevantName}
                      title={p.productName}
                    >
                      {p.productName}
                    </Link>

                    <div className={styles.relevantPriceRow}>
                      <span className={styles.relevantPrice}>
                        ₹{displayPrice.toLocaleString()}
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
                          <FiCheck />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <FiShoppingBag />
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