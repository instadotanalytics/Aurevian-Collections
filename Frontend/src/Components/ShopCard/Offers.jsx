// src/Components/Offers/Offers.jsx

import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowLeft,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import styles from "./Offers.module.css";

import { fetchFeaturedProducts } from "../../redux/slices/featuredProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import { toggleWishlistItem } from "../../redux/slices/wishlistSlice";

const SECTION = "specially-made";
const ACCENTS = ["ink", "ivory", "emerald"];
const SKELETON_COUNT = 4;
const LOADING_THROTTLE_MS = 800;

function StarRating({ rating }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={styles.stars} aria-hidden="true">
      {stars.map((s) => (
        <FaStar
          key={s}
          className={
            s <= Math.round(rating) ? styles.starFilled : styles.starEmpty
          }
        />
      ))}
    </span>
  );
}

const getBadgeLabel = (labels) => {
  if (!labels) return null;
  if (labels.newArrival) return "New";
  if (labels.bestSeller) return "Best Seller";
  if (labels.trending) return "Trending";
  if (labels.flashSale) return "Flash Sale";
  if (labels.featured) return "Featured";
  return null;
};

const getDiscount = (product) => {
  const original = product.pricing?.originalPrice;
  const sale = product.pricing?.salePrice;
  if (sale && original && sale < original) {
    return Math.round(((original - sale) / original) * 100);
  }
  return 0;
};

function SkeletonCard() {
  return (
    <div className={styles.cardWrapper}>
      <div className={`${styles.card} ${styles.skeletonCard}`}>
        <div className={styles.imageFrame}>
          <div className={styles.skeletonImage} />
        </div>
        <div className={styles.info}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
          <div className={styles.skeletonBtn} />
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  accent,
  onClickCapture,
  isInCart,
  isInWishlist,
  cartLoading,
  onAddToCart,
  onToggleWishlist,
}) {
  const displayPrice =
    product.pricing?.salePrice || product.pricing?.originalPrice;
  const hasDiscount =
    product.pricing?.salePrice &&
    product.pricing?.salePrice < product.pricing?.originalPrice;
  const discount = getDiscount(product);
  const hasReviews = (product.reviews?.totalReviews || 0) > 0;
  const categoryLabel = product.category?.categoryData?.label || "";

  return (
    <div className={styles.cardWrapper}>
      <Link
        to={`/product/${product.productSlug}`}
        className={`${styles.card} ${styles[`accent-${accent}`]}`}
        aria-label={product.productName}
        onClickCapture={onClickCapture}
        draggable="false"
      >
        {/* Discount Badge - Top Left */}
        {discount > 0 && (
          <span className={styles.badge}>{discount}% off</span>
        )}

        {/* Wishlist Button - Top Right */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${isInWishlist ? styles.wishlistBtnActive : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product._id);
          }}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isInWishlist}
        >
          {isInWishlist ? <FaHeart /> : <FiHeart />}
        </button>

        <div className={styles.imageFrame}>
          {product.thumbnail?.url ? (
            <img
              src={product.thumbnail.url}
              alt={product.productName}
              className={styles.image}
              loading="lazy"
              draggable="false"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}

          {/* Category Overlay - Bottom Left */}
          {categoryLabel && (
            <span className={styles.categoryOverlay}>{categoryLabel}</span>
          )}
        </div>

        <div className={styles.info}>
          <Link
            to={`/product/${product.productSlug}`}
            className={styles.productName}
            title={product.productName}
          >
            {product.productName}
          </Link>

          {hasReviews && (
            <div className={styles.ratingRow}>
              <StarRating rating={product.reviews.averageRating} />
              <span className={styles.ratingValue}>
                {product.reviews.averageRating.toFixed(1)}{" "}
                <span className={styles.ratingCount}>
                  ({product.reviews.totalReviews})
                </span>
              </span>
            </div>
          )}

          <div className={styles.priceRow}>
            <span className={styles.price}>
              ₹{displayPrice?.toLocaleString("en-IN") || "0"}
            </span>
            {hasDiscount && (
              <span className={styles.oldPrice}>
                ₹{product.pricing.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={styles.cartBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product._id);
          }}
          aria-label={isInCart ? "Already in cart" : "Add to cart"}
          disabled={isInCart || cartLoading}
        >
          <FiShoppingBag />
          Add to Cart
        </button>
      </Link>
    </div>
  );
}

export default function Offers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { products, isLoading, error } = useSelector(
    (state) =>
      state.featuredProducts.bySection[SECTION] || {
        products: [],
        isLoading: true,
        error: null,
      },
  );

  const [cartLoadingId, setCartLoadingId] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Throttled loading - show skeleton for minimum duration
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, LOADING_THROTTLE_MS);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
    }
  }, [isLoading]);

  useEffect(() => {
    dispatch(fetchFeaturedProducts(SECTION));
  }, [dispatch]);

  const scrollContainerRef = useRef(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const handleMouseDown = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    dragState.current.isDown = true;
    dragState.current.moved = false;
    dragState.current.startX = e.pageX - el.offsetLeft;
    dragState.current.startScrollLeft = el.scrollLeft;
    el.classList.add(styles.dragging);
  };

  const endDrag = () => {
    const el = scrollContainerRef.current;
    dragState.current.isDown = false;
    if (el) el.classList.remove(styles.dragging);
  };

  const handleMouseMove = (e) => {
    const el = scrollContainerRef.current;
    if (!el || !dragState.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startScrollLeft - walk;
  };

  const handleClickCapture = (e) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onMouseLeave = () => endDrag();
    const onMouseUp = () => endDrag();
    el.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/" } });
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

  // Show nothing if error or no products
  if (!isLoading && !showSkeleton && (error || products.length === 0)) {
    return null;
  }

  // Show skeleton while loading or during throttle
  const shouldShowSkeleton = isLoading || showSkeleton;
  const skeletonItems = Array.from({ length: SKELETON_COUNT }, (_, i) => ({
    _skeletonId: i,
  }));

  return (
    <section className={styles.section} aria-labelledby="offers-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.topText}>✦ Specially Made ✦</p>
            <h2 id="offers-heading" className={styles.heading}>
              Offers Worth The Splurge
            </h2>
            <p className={styles.subHeading}>
              Handpicked discounts on the pieces our customers love most
            </p>
          </div>

          <div className={styles.headerActions}>
            <a href="/shop/offers" className={styles.viewAllBtn}>
              View All
              <FiArrowRight className={styles.viewAllIcon} />
            </a>

            <div className={styles.navArrows}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={scrollLeft}
                aria-label="Scroll left"
              >
                <FiArrowLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={scrollRight}
                aria-label="Scroll right"
              >
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          className={styles.scrollContainer}
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {shouldShowSkeleton
            ? skeletonItems.map((item) => <SkeletonCard key={item._skeletonId} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  accent={ACCENTS[index % ACCENTS.length]}
                  onClickCapture={handleClickCapture}
                  isInCart={isInCart(product._id)}
                  isInWishlist={isInWishlist(product._id)}
                  cartLoading={cartLoadingId === product._id}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
        </div>
      </div>
    </section>
  );
}