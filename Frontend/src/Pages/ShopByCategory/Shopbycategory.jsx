
import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import styles from "./Shopbycategory.module.css";
import earringsImg from "../../assets/earrings.png";
import necklacesImg from "../../assets/necklaces.png";
import ringsImg from "../../assets/rings.png";
import braceletsImg from "../../assets/bracelets.png";
import ankletsImg from "../../assets/anklets.png";
import bridalImg from "../../assets/bridal.png";

const CATEGORIES = [
  { id: "earrings", name: "Earrings", image: earringsImg },
  { id: "necklaces", name: "Necklaces", image: necklacesImg },
  { id: "rings", name: "Rings", image: ringsImg },
  { id: "bracelets", name: "Bracelets", image: braceletsImg },
  { id: "anklets", name: "Anklets", image: ankletsImg },
  { id: "bridal", name: "Bridal", image: bridalImg },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};


const CategoryCard = React.memo(function CategoryCard({ category }) {
  return (
    <motion.div
      className={styles.card}
      variants={cardVariants}
    >
      <a
        href={`/category/${category.id}`}
        className={styles.cardLink}
        aria-label={`Explore ${category.name}`}
      >
        <div className={styles.imageWrap}>
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div
              className={styles.imagePlaceholder}
              aria-hidden="true"
            />
          )}

          <span
            className={styles.ring}
            aria-hidden="true"
          />
        </div>

        <h3 className={styles.categoryName}>
          {category.name}
        </h3>
      </a>
    </motion.div>
  );
});

export default function ShopByCategory() {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByAmount = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`.${styles.card}`);
    const cardWidth = card ? card.getBoundingClientRect().width : 200;
    const gap = 32;
    const distance = (cardWidth + gap) * 2 * direction;
    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <section className={styles.section} aria-labelledby="shop-by-category-heading">
      <div className={styles.glowTopLeft} aria-hidden="true" />
      <div className={styles.glowBottomRight} aria-hidden="true" />

      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>Shop by Category</span>
          <span className={styles.headerDivider} aria-hidden="true" />
          <h2 id="shop-by-category-heading" className={styles.heading}>
            Discover Your Signature Style
          </h2>
          <p className={styles.subheading}>
            Timeless designs for every moment, made for you.
          </p>
        </motion.div>

        <div className={styles.sliderWrap}>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll to previous categories"
          >
            <FiChevronLeft />
          </button>

          <motion.div
            className={styles.track}
            ref={trackRef}
            role="region"
            aria-label="Jewellery categories"
            tabIndex={0}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </motion.div>

          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonRight}`}
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label="Scroll to next categories"
          >
            <FiChevronRight />
          </button>
        </div>

        <motion.div
          className={styles.ctaWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className={styles.ctaLine} aria-hidden="true" />
          <a href="/collections" className={styles.ctaButton}>
            <HiOutlineShoppingBag className={styles.ctaIcon} aria-hidden="true" />
            View All Collections
          </a>
          <span className={styles.ctaLine} aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}