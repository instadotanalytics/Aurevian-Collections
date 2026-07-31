// src/Components/NewCollections/NewCollections.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { FiArrowRight, FiArrowLeft, FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import styles from "./NewCollections.module.css";

// ==========================================================
// NEW COLLECTION IMAGES
// ==========================================================
const NEW_COLLECTION_IMAGES = {
  diamondNecklace: "https://i.pinimg.com/736x/c9/7e/9f/c97e9f9a6888e906eff403d2b703297c.jpg",
  goldRing: "https://i.pinimg.com/1200x/4d/94/ee/4d94ee4c9ac395cc0b8339b2aedd9fb1.jpg",
  emeraldEarrings: "https://i.pinimg.com/736x/7f/00/a0/7f00a0eed6732c3827f5a41a1f2a9c45.jpg",
  pearlBracelet: "https://i.pinimg.com/736x/b3/0a/b5/b30ab5738f474f74e01baddc9f11d9eb.jpg",
  sapphirePendant: "https://i.pinimg.com/736x/03/55/9c/03559cf6a40ba8d586b1c91aee84910a.jpg",
  rubyStuds: "https://i.pinimg.com/1200x/82/b8/a9/82b8a9520e7037d5de2cb82ce4896902.jpg",
  platinumBand: "https://i.pinimg.com/736x/4f/38/fb/4f38fba0d238d0d74979baa86abe77da.jpg",
  tanzaniteRing: "https://i.pinimg.com/736x/92/48/bc/9248bcb8e9b4cec255ea2f5dbf891209.jpg",
};

// ==========================================================
// NEW COLLECTION PRODUCT DATA
// ==========================================================
const NEW_PRODUCTS = [
  { id: "n1", name: "Diamond Halo Necklace", price: 12999, oldPrice: 16999, rating: 4.9, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.diamondNecklace },
  { id: "n2", name: "18K Gold Statement Ring", price: 8999, oldPrice: 11999, rating: 4.8, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.goldRing },
  { id: "n3", name: "Emerald Drop Earrings", price: 7499, oldPrice: 9999, rating: 4.7, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.emeraldEarrings },
  { id: "n4", name: "Freshwater Pearl Bracelet", price: 5499, oldPrice: 6999, rating: 4.6, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.pearlBracelet },
  { id: "n5", name: "Sapphire Pendant Set", price: 9999, oldPrice: 13999, rating: 4.9, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.sapphirePendant },
  { id: "n6", name: "Ruby Stud Earrings", price: 6499, oldPrice: 8499, rating: 4.7, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.rubyStuds },
  { id: "n7", name: "Platinum Wedding Band", price: 15999, oldPrice: 19999, rating: 4.9, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.platinumBand },
  { id: "n8", name: "Tanzanite Cocktail Ring", price: 11999, oldPrice: 15999, rating: 4.8, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.tanzaniteRing },
  { id: "n9", name: "Rose Gold Pendant", price: 7999, oldPrice: 10999, rating: 4.8, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.diamondNecklace },
  { id: "n10", name: "Silver Chain Bracelet", price: 4499, oldPrice: 5999, rating: 4.6, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.pearlBracelet },
  { id: "n11", name: "Pearl Stud Earrings", price: 3499, oldPrice: 4999, rating: 4.7, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.rubyStuds },
];

function StarRating({ rating }) {
  const stars = [1, 2, 3, 4, 5];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <span className={styles.stars} aria-hidden="true">
      {stars.map((s) => {
        if (s <= fullStars) {
          return <FaStar key={s} className={styles.starFilled} />;
        } else if (s === fullStars + 1 && hasHalfStar) {
          return <FaStar key={s} className={styles.starHalf} />;
        } else {
          return <FaStar key={s} className={styles.starEmpty} />;
        }
      })}
    </span>
  );
}

function ProductCard({ product, cardRef, style }) {
  const [wishlisted, setWishlisted] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={styles.cardWrapper}
      ref={cardRef}
      style={style}
    >
      <a
        href={`/product/${product.id}`}
        className={styles.card}
        aria-label={product.name}
        draggable="false"
      >
        {/* Wishlist Button */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistBtnActive : ""}`}
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
        >
          <FiHeart />
        </button>

        {/* Badge */}
        <span className={styles.badge}>
          New
          <br />
          Collection
        </span>

        {/* Image */}
        <div className={styles.imageWrap}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.collectionTag}>✦ AUREVIAN COLLECTIONS</p>
          <h3 className={styles.title}>{product.name}</h3>

          <div className={styles.metaRow}>
            <StarRating rating={product.rating} />
            <span className={styles.ratingValue}>{product.rating.toFixed(1)}</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
            {product.oldPrice ? (
              <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
            ) : null}
          </div>

          <button type="button" className={styles.cartBtn} onClick={handleAddToCart}>
            <FiShoppingBag className={styles.cartIcon} />
            <span>Add to Cart</span>
          </button>
        </div>
      </a>
    </div>
  );
}

export default function NewCollections() {
  const scrollContainerRef = useRef(null);
  const cardRefsMap = useRef(new Map());
  const [cardStyles, setCardStyles] = useState({});
  const rafRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const setCardRef = useCallback((id) => (el) => {
    if (el) {
      cardRefsMap.current.set(id, el);
    } else {
      cardRefsMap.current.delete(id);
    }
  }, []);

  // ==========================================================
  // COVERFLOW EFFECT: Center card is largest, sides are smaller
  // ==========================================================
  const updateCardScales = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    const next = {};
    cardRefsMap.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      const maxDistance = containerRect.width / 2 + rect.width / 2;
      const proximity = Math.max(0, 1 - distance / maxDistance);

      // Smooth scaling: center card is largest
      const scale = 0.82 + proximity * 0.22;
      const lift = proximity * 16;
      const opacity = 0.6 + proximity * 0.4;
      const zIndex = Math.round(proximity * 10) + 1;

      next[id] = {
        transform: `translateY(-${lift}px) scale(${scale})`,
        opacity,
        zIndex,
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease',
      };
    });

    setCardStyles(next);
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateCardScales);
  }, [updateCardScales]);

  // Scroll to center a specific card
  const scrollToCard = useCallback((cardId) => {
    const container = scrollContainerRef.current;
    const cardEl = cardRefsMap.current.get(cardId);
    if (!container || !cardEl) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    const scrollOffset = cardRect.left - containerRect.left - containerRect.width / 2 + cardRect.width / 2;

    container.scrollBy({
      left: scrollOffset,
      behavior: 'smooth'
    });
  }, []);

  // Snap to nearest card on scroll end
  const snapToNearestCard = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let nearestId = null;
    let nearestDistance = Infinity;

    cardRefsMap.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = id;
      }
    });

    if (nearestId) {
      scrollToCard(nearestId);
    }
  }, [scrollToCard]);

  // Mouse drag for desktop
  const handleMouseDown = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftPos(container.scrollLeft);
    container.style.cursor = 'grabbing';
    container.style.scrollBehavior = 'auto';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseUp = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.scrollBehavior = 'smooth';
    }
    setIsDragging(false);
    // Snap after drag
    setTimeout(snapToNearestCard, 100);
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setStartX(touch.pageX - container.offsetLeft);
    setScrollLeftPos(container.scrollLeft);
    container.style.scrollBehavior = 'auto';
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const touch = e.touches[0];
    const x = touch.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeftPos - walk;
  };

  const handleTouchEnd = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.style.scrollBehavior = 'smooth';
    }
    setIsDragging(false);
    setTimeout(snapToNearestCard, 100);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const initialTimer = setTimeout(updateCardScales, 100);

    // Use scroll event with passive: true for performance
    container.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      clearTimeout(initialTimer);
      container.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleUpdate, updateCardScales]);

  // Update on mount and when products change
  useEffect(() => {
    const timer = setTimeout(updateCardScales, 200);
    return () => clearTimeout(timer);
  }, [updateCardScales]);

  const scrollByPage = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(`.${styles.cardWrapper}`)?.offsetWidth || 250;
    el.scrollBy({ left: direction * (cardWidth + 24), behavior: "smooth" });
  };

  const scrollLeft = () => scrollByPage(-1);
  const scrollRight = () => scrollByPage(1);

  return (
    <section className={styles.section} aria-labelledby="new-collections-heading">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.topText}>Fresh Arrivals</p>
            <div className={styles.headerText}>
              <h2 id="new-collections-heading" className={styles.heading}>
                New Collections
              </h2>
              <span className={styles.headingRule} aria-hidden="true" />
            </div>
          </div>

          <div className={styles.headerRight}>
            <a href="/shop/new-arrivals" className={styles.viewAllBtn}>
              View All
            </a>

            <div className={styles.navArrows}>
              <button type="button" className={styles.navBtn} onClick={scrollLeft} aria-label="Scroll left">
                <FiArrowLeft size={15} />
              </button>
              <button type="button" className={styles.navBtn} onClick={scrollRight} aria-label="Scroll right">
                <FiArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        <div 
          className={styles.scrollContainer} 
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {NEW_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cardRef={setCardRef(product.id)}
              style={cardStyles[product.id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}