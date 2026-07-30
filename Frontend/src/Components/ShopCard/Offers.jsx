// src/Components/Offers/Offers.jsx

import React, { useRef, useEffect, useState } from "react";
import { FiArrowRight, FiArrowLeft, FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import styles from "./Offers.module.css";

// ==========================================================
// OFFERS IMAGES
// ==========================================================
const OFFER_IMAGES = {
  diwali: "https://i.pinimg.com/1200x/d0/53/0d/d0530dca94a42e2caef39cc9dd740dde.jpg",
  summer: "https://i.pinimg.com/736x/2e/42/64/2e4264277939897b5a3ed0b996f148bf.jpg",
  festive: "https://i.pinimg.com/1200x/dc/b9/9d/dcb99d9fd6de932c239de89b0ad6e684.jpg",
  clearance: "https://i.pinimg.com/736x/b0/e6/27/b0e62737469ed749d17bb85563ce05ac.jpg",
  bridal: "https://i.pinimg.com/736x/8d/7a/92/8d7a923b009698993ffeede1c68b7a92.jpg",
  anniversary: "https://i.pinimg.com/736x/1f/5c/34/1f5c3450b9e81721e97df7486bf97c28.jpg",
  wedding: "https://i.pinimg.com/736x/ba/92/43/ba9243fb483eb668e44d9fdccb1afb40.jpg",
  gold: "https://i.pinimg.com/736x/f9/d6/06/f9d606f3f13a92ebdaa8009877864878.jpg",
};

/* ------------------------------------------------------------------
   OFFERS DATA
   `accent` cycles the card's color theme (ink / ivory / emerald),
   mirroring how the reference "Daisy Bloom Ring" style cards alternate
   dark / light / deep-color backgrounds.
------------------------------------------------------------------ */
const ACCENTS = ["ink", "ivory", "emerald"];

const OFFER_PRODUCTS = [
  { id: "o1", name: "Diwali Special Gold Set", badge: "New", price: 19999, oldPrice: 29999, rating: 4.8, reviews: 124, image: OFFER_IMAGES.diwali },
  { id: "o2", name: "Summer Collection Rings", badge: "Offers", price: 6999, oldPrice: 9999, rating: 4.7, reviews: 96, image: OFFER_IMAGES.summer },
  { id: "o3", name: "Festive Gold Earrings", badge: "Trending", price: 8499, oldPrice: 12999, rating: 4.9, reviews: 78, image: OFFER_IMAGES.festive },
  { id: "o4", name: "Clearance Sale Pendants", badge: "Best Seller", price: 4499, oldPrice: 7499, rating: 4.6, reviews: 150, image: OFFER_IMAGES.clearance },
  { id: "o5", name: "Bridal Collection Offer", badge: "Offers", price: 15999, oldPrice: 21999, rating: 4.9, reviews: 112, image: OFFER_IMAGES.bridal },
  { id: "o6", name: "Anniversary Diamond Set", badge: "New", price: 12999, oldPrice: 18999, rating: 4.7, reviews: 85, image: OFFER_IMAGES.anniversary },
  { id: "o7", name: "Wedding Season Special", badge: "Trending", price: 24999, oldPrice: 34999, rating: 4.8, reviews: 134, image: OFFER_IMAGES.wedding },
  { id: "o8", name: "Gold Rate Discount", badge: "Best Seller", price: 8999, oldPrice: 12999, rating: 4.6, reviews: 67, image: OFFER_IMAGES.gold },
].map((product, index) => ({
  ...product,
  accent: ACCENTS[index % ACCENTS.length],
}));

function StarRating({ rating }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={styles.stars} aria-hidden="true">
      {stars.map((s) => (
        <FaStar key={s} className={s <= Math.round(rating) ? styles.starFilled : styles.starEmpty} />
      ))}
    </span>
  );
}

function ProductCard({ product, onClickCapture }) {
  const [wishlisted, setWishlisted] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // hook up to cart logic here
  };

  return (
    <div className={styles.cardWrapper}>

    <a
      href={`/product/${product.id}`}
      className={`${styles.card} ${styles[`accent-${product.accent}`]}`}
      aria-label={product.name}
      onClickCapture={onClickCapture}
      draggable="false"
    >
      <span className={styles.badge}>{product.badge}</span>

      <button
        type="button"
        className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistBtnActive : ""}`}
        onClick={toggleWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
      >
        {wishlisted ? <FaHeart /> : <FiHeart />}
      </button>

      <div className={styles.imageFrame}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={styles.image}
            loading="lazy"
            draggable="false"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.eyebrow}>Aurevian Collections</p>
        <h3 className={styles.title}>{product.name}</h3>

        <div className={styles.ratingRow}>
          <StarRating rating={product.rating} />
          <span className={styles.ratingValue}>
            {product.rating.toFixed(1)} <span className={styles.ratingCount}>({product.reviews})</span>
          </span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
          <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <button type="button" className={styles.cartBtn} onClick={handleAddToCart} aria-label="Add to cart">
        <FiShoppingBag />
      </button>
    </a>
    </div>
  );
}

export default function Offers() {
  const scrollContainerRef = useRef(null);

  // Drag-to-scroll (click + drag with the cursor, left to right)
  const dragState = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false });

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

  // Prevent the click from firing (and navigating) right after a drag
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

  return (
    <section className={styles.section} aria-labelledby="offers-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.topText}>✦ Specially Made ✦</p>
            <h2 id="offers-heading" className={styles.heading}>
              Offers Worth The Splurge
            </h2>
            <p className={styles.subHeading}>Handpicked discounts on the pieces our customers love most</p>
          </div>

          <div className={styles.headerActions}>
            <a href="/shop/offers" className={styles.viewAllBtn}>
              View All
              <FiArrowRight className={styles.viewAllIcon} />
            </a>

            <div className={styles.navArrows}>
              <button type="button" className={styles.navBtn} onClick={scrollLeft} aria-label="Scroll left">
                <FiArrowLeft size={16} />
              </button>
              <button type="button" className={styles.navBtn} onClick={scrollRight} aria-label="Scroll right">
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
          {OFFER_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onClickCapture={handleClickCapture} />
          ))}
        </div>
      </div>
    </section>
  );
}