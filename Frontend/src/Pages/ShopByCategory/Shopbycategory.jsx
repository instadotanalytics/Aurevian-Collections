// ShopByCategory.jsx
// Premium, compact "Shop by Category" section with a slow, continuous
// left-moving marquee. Autoplay pauses on hover/focus, respects
// prefers-reduced-motion, and the arrow buttons still work for manual paging.
//
// Categories are fetched from the active HeaderConfig (shopMegaMenu.categories)
// via fetchPublicHeaderConfig — the same source that drives the navbar's Shop
// mega menu. There is no hardcoded category list: if HeaderConfig has zero
// categories, this section renders an empty state instead of falling back
// to a fixed array.

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./Shopbycategory.module.css";
import { fetchPublicHeaderConfig } from "./../../redux/slices/headerConfigSlice.js";

// Skeleton placeholders — purely a loading-state visual, not real data
const SKELETON_CATEGORIES = Array(8)
  .fill(null)
  .map((_, index) => ({
    id: `skeleton-${index}`,
    label: "",
    path: "",
    image: "",
    isSkeleton: true,
  }));

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

// ✅ Categories navigate by their existing HeaderConfig id, via the Shop
// page's ?category= query param — NOT by category.path (which is free-text
// set by whoever edits HeaderConfig and isn't guaranteed to match a real
// route). Shop.jsx reads this param on mount and feeds it into its
// existing category filter, so this works for any category id, present
// or future, without any per-category conditionals.
const getCategoryHref = (category) =>
  category?.id ? `/shop?category=${encodeURIComponent(category.id)}` : "/shop";

// Skeleton Card
const SkeletonCard = React.memo(function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardLink}>
        <div className={styles.imageWrap}>
          <div className={styles.skeletonImage} />
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
        to={getCategoryHref(category)}
        className={styles.cardLink}
        aria-label={`Explore ${category.label}`}
        tabIndex={-1}
      >
        <div className={styles.imageWrap}>
          <span className={styles.ring} aria-hidden="true" />
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

  // Fetch config on mount
  useEffect(() => {
    if (!config) {
      dispatch(fetchPublicHeaderConfig());
    }
  }, [dispatch, config]);

  // Update categories when config loads.
  // ✅ No hardcoded fallback array: if HeaderConfig has no categories,
  // we set an empty list and let the empty-state UI below handle it.
  useEffect(() => {
    if (config?.shopMegaMenu?.categories?.length > 0) {
      const timer = setTimeout(() => {
        setCategories(config.shopMegaMenu.categories);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (config && !configLoading) {
      const timer = setTimeout(() => {
        setCategories([]);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [config, configLoading]);

  // Hard stop if the fetch stalls or fails — same empty-state result,
  // no fabricated categories.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setCategories([]);
        setIsLoading(false);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const showSkeletons = isLoading || categories.some((c) => c.isSkeleton);
  const isEmpty = !showSkeletons && categories.length === 0;

  /* ------------------------- continuous marquee ------------------------- */

  const trackRef = useRef(null);
  const posRef = useRef(0);
  const isPausedRef = useRef(false);
  const isNudgingRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Reset position whenever the underlying category set changes
  useEffect(() => {
    posRef.current = 0;
    if (trackRef.current) {
      trackRef.current.style.transform = "translateX(0px)";
    }
  }, [categories, showSkeletons]);

  // Autoplay loop — slow, constant-speed, seamless leftward drift
  useEffect(() => {
    if (showSkeletons || isEmpty) return undefined;

    const track = trackRef.current;
    if (!track) return undefined;

    let rafId;
    let last = performance.now();
    const SPEED_PX_PER_SEC = 26; // slow & premium, not jarring

    const step = (now) => {
      const dt = now - last;
      last = now;

      if (!reducedMotion && !isPausedRef.current && !isNudgingRef.current) {
        const setWidth = track.scrollWidth / 2; // list is duplicated x2
        if (setWidth > 0) {
          posRef.current -= (SPEED_PX_PER_SEC * dt) / 1000;
          if (posRef.current <= -setWidth) posRef.current += setWidth;
          track.style.transform = `translateX(${posRef.current}px)`;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [showSkeletons, isEmpty, reducedMotion, categories]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    if (!isNudgingRef.current) isPausedRef.current = false;
  }, []);

  const nudge = useCallback((direction) => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector(`.${styles.card}`);
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 140;
    const gap = 16;
    const distance = (cardWidth + gap) * 2;

    isPausedRef.current = true;
    isNudgingRef.current = true;

    posRef.current -= direction * distance;

    const setWidth = track.scrollWidth / 2;
    if (setWidth > 0) {
      if (posRef.current <= -setWidth) posRef.current += setWidth;
      if (posRef.current > 0) posRef.current -= setWidth;
    }

    track.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    track.style.transform = `translateX(${posRef.current}px)`;

    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      track.style.transition = "";
      isNudgingRef.current = false;
      isPausedRef.current = false;
    }, 550);
  }, []);

  useEffect(() => () => clearTimeout(resumeTimeoutRef.current), []);

  // Duplicate the list for a seamless infinite loop
  const displayItems = showSkeletons
    ? SKELETON_CATEGORIES
    : [...categories, ...categories];

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
          <p className={styles.topText}>✦ Discover Our Collections ✦</p>

          <h2 id="shop-by-category-heading" className={styles.heading}>
            <span className={styles.shop}>Shop</span>
            <span className={styles.by}>By</span>
            <span className={styles.category}>Category</span>
          </h2>

          <div className={styles.headerDivider} aria-hidden="true" />
        </motion.div>

        {isEmpty ? (
          // No categories configured yet — no fabricated placeholder data,
          // just an honest empty state until categories are added upstream.
          <p
            style={{
              textAlign: "center",
              color: "#8a8072",
              padding: "24px 0",
              fontSize: "14px",
            }}
          >
            Categories are being updated. Check back shortly.
          </p>
        ) : (
          <>
            <div className={styles.sliderWrap}>
              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonLeft} ${styles.desktopNav}`}
                onClick={() => nudge(-1)}
                aria-label="Show previous categories"
              >
                <FiChevronLeft />
              </button>

              <div
                className={styles.marqueeViewport}
                role="region"
                aria-label="Jewellery categories"
                tabIndex={0}
                onMouseEnter={pause}
                onMouseLeave={resume}
                onFocus={pause}
                onBlur={resume}
              >
                <div
                  className={`${styles.marqueeTrack} ${showSkeletons ? styles.loadingTrack : styles.loadedTrack}`}
                  ref={trackRef}
                >
                  {showSkeletons
                    ? displayItems.map((_, index) => (
                        <SkeletonCard key={`skeleton-${index}`} />
                      ))
                    : displayItems.map((category, index) => (
                        <CategoryCard
                          key={`${category.id}-${index}`}
                          category={category}
                        />
                      ))}
                </div>
              </div>

              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonRight} ${styles.desktopNav}`}
                onClick={() => nudge(1)}
                aria-label="Show next categories"
              >
                <FiChevronRight />
              </button>
            </div>

            <div className={styles.mobileNav}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => nudge(-1)}
                aria-label="Show previous categories"
              >
                <FiChevronLeft />
              </button>

              <button
                type="button"
                className={styles.navButton}
                onClick={() => nudge(1)}
                aria-label="Show next categories"
              >
                <FiChevronRight />
              </button>
            </div>
          </>
        )}

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
