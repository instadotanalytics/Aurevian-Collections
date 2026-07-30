// Shopbycategory.jsx - Update the categories state and add a useEffect to handle updates

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./Shopbycategory.module.css";
import { fetchPublicHeaderConfig } from "./../../redux/slices/headerConfigSlice.js";

// Fallback categories with 8 categories pre-loaded
const FALLBACK_CATEGORIES = [
  { id: "earrings", label: "Earrings", path: "/shop/earrings", image: "" },
  { id: "necklaces", label: "Necklaces", path: "/shop/necklaces", image: "" },
  { id: "rings", label: "Rings", path: "/shop/rings", image: "" },
  { id: "bracelets", label: "Bracelets", path: "/shop/bracelets", image: "" },
  { id: "anklets", label: "Anklets", path: "/shop/anklets", image: "" },
  { id: "bridal", label: "Bridal", path: "/shop/bridal", image: "" },
  { id: "nosepin", label: "Nosepin", path: "/shop/nosepin", image: "" },
  { id: "chains", label: "Chains", path: "/shop/chains", image: "" },
];

// Create skeleton data (8 placeholders)
const SKELETON_CATEGORIES = Array(8)
  .fill(null)
  .map((_, index) => ({
    id: `skeleton-${index}`,
    label: "",
    path: "",
    image: "",
    isSkeleton: true,
  }));

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const getInitials = (label = "") =>
  label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// Skeleton Card Component
const SkeletonCard = React.memo(function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardLink}>
        <div className={styles.imageWrap}>
          <div className={styles.skeletonImage} />
          <span className={styles.ring} aria-hidden="true" />
        </div>
        <div className={styles.skeletonText} />
      </div>
    </div>
  );
});

const CategoryCard = React.memo(function CategoryCard({ category }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(category.image) && !imageFailed;

  return (
    <motion.div className={styles.card} variants={cardVariants}>
      <Link
        to={category.path || "/shop"}
        className={styles.cardLink}
        aria-label={`Explore ${category.label}`}
      >
        <div className={styles.imageWrap}>
          {hasImage ? (
            <img
              src={category.image}
              alt={category.label}
              className={styles.image}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true">
              <span className={styles.imagePlaceholderText}>
                {getInitials(category.label) || "?"}
              </span>
            </div>
          )}
          <span className={styles.ring} aria-hidden="true" />
        </div>
        <h3 className={styles.categoryName}>{category.label}</h3>
      </Link>
    </motion.div>
  );
});

export default function ShopByCategory() {
  const dispatch = useDispatch();
  const { config, isLoading: configLoading } = useSelector(
    (state) => state.headerConfig,
  );
  const [categories, setCategories] = useState(SKELETON_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Fetch config on mount
  useEffect(() => {
    if (!config) {
      dispatch(fetchPublicHeaderConfig());
    }
  }, [dispatch, config]);

  // Update categories when config loads
  useEffect(() => {
    if (config?.shopMegaMenu?.categories?.length > 0) {
      const timer = setTimeout(() => {
        setCategories(config.shopMegaMenu.categories);
        setIsLoading(false);
        setTimeout(() => setShowContent(true), 100);
      }, 300);
      return () => clearTimeout(timer);
    } else if (config && !configLoading) {
      const timer = setTimeout(() => {
        setCategories(FALLBACK_CATEGORIES);
        setIsLoading(false);
        setTimeout(() => setShowContent(true), 100);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [config, configLoading]);

  // If loading takes too long, show fallback after 2 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setCategories(FALLBACK_CATEGORIES);
        setIsLoading(false);
        setTimeout(() => setShowContent(true), 100);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  // Update scroll state when categories change
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      updateScrollState();
    });

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    // Also update on category changes
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, categories]);

  // Force update scroll state when categories change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollState();
    }, 100);
    return () => clearTimeout(timer);
  }, [categories, updateScrollState]);

  const scrollByAmount = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`.${styles.card}`);
    const cardWidth = card ? card.getBoundingClientRect().width : 140;
    const gap = 16;
    const distance = (cardWidth + gap) * 2 * direction;
    el.scrollBy({ left: distance, behavior: "smooth" });

    // Update scroll state after scroll
    setTimeout(() => updateScrollState(), 100);
  };

  // Determine if we should show skeletons
  const showSkeletons = isLoading || categories.some((c) => c.isSkeleton);

  return (
    <section
      className={styles.section}
      aria-labelledby="shop-by-category-heading"
    >
      <div className={styles.glowTopLeft} aria-hidden="true" />
      <div className={styles.glowBottomRight} aria-hidden="true" />

      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.topText}>✦ DISCOVER OUR COLLECTIONS ✦</p>

          <h2 id="shop-by-category-heading" className={styles.heading}>
            <span className={styles.shop}>Shop</span>
            <span className={styles.by}>By</span>
            <span className={styles.category}>Category</span>
          </h2>

          <div className={styles.headerDivider} aria-hidden="true" />
        </motion.div>

        <div className={styles.sliderWrap}>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonLeft} ${styles.desktopNav}`}
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll to previous categories"
          >
            <FiChevronLeft />
          </button>

          <motion.div
            className={`${styles.track} ${showSkeletons ? styles.loadingTrack : styles.loadedTrack}`}
            ref={trackRef}
            role="region"
            aria-label="Jewellery categories"
            tabIndex={0}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            key={categories.length}
          >
            {showSkeletons
              ? SKELETON_CATEGORIES.map((_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))
              : categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
          </motion.div>

          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonRight} ${styles.desktopNav}`}
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label="Scroll to next categories"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className={styles.mobileNav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll to previous categories"
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            className={styles.navButton}
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label="Scroll to next categories"
          >
            <FiChevronRight />
          </button>
        </div>

        <motion.div
          className={styles.ctaWrap}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className={styles.ctaLine} aria-hidden="true" />
          <span className={styles.ctaLine} aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
