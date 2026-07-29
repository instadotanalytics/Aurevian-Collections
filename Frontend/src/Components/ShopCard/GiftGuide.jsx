// src/Components/GiftGuide/GiftGuide.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import styles from "./GiftGuide.module.css";

// ==========================================================
// GIFT GUIDE IMAGES
// ==========================================================
const GIFT_IMAGES = {
  anniversary: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop&crop=center&q=80",
  birthday: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop&crop=center&q=80",
  wedding: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop&crop=center&q=80",
  mother: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop&crop=center&q=80",
  valentine: "https://images.unsplash.com/photo-1611085583191-a3b181f3d6c0?w=500&h=500&fit=crop&crop=center&q=80",
  festival: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&h=500&fit=crop&crop=center&q=80",
  graduation: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=500&fit=crop&crop=center&q=80",
  corporate: "https://images.unsplash.com/photo-1589128777073-4375663d2ed2?w=500&h=500&fit=crop&crop=center&q=80",
};

// ==========================================================
// GIFT GUIDE PRODUCT DATA (swap for real/dynamic data later)
// ==========================================================
const GIFT_PRODUCTS = [
  { id: "g1", name: "Angel Wings Charm", price: 899, oldPrice: 1299, image: GIFT_IMAGES.anniversary },
  { id: "g2", name: "Diamond Solitaire Pendant", price: 12999, oldPrice: 16999, image: GIFT_IMAGES.birthday },
  { id: "g3", name: "Sparkling Heart Drop Pendant", price: 2499, oldPrice: 3299, image: GIFT_IMAGES.wedding },
  { id: "g4", name: "Sparkling Crystal Heart Pendant", price: 1899, oldPrice: 2599, image: GIFT_IMAGES.mother },
  { id: "g5", name: "Ruby Heart Charm", price: 3499, oldPrice: 4499, image: GIFT_IMAGES.valentine },
  { id: "g6", name: "Festival Gold Drop Earrings", price: 6499, oldPrice: 8499, image: GIFT_IMAGES.festival },
  { id: "g7", name: "Graduation Charm Bracelet", price: 5499, oldPrice: 6999, image: GIFT_IMAGES.graduation },
  { id: "g8", name: "Corporate Gifting Set", price: 19999, oldPrice: 25999, image: GIFT_IMAGES.corporate },
];

function ProductCard({ product }) {
  return (
    <div className={styles.card}>
      <a href={`/product/${product.id}`} className={styles.cardLink} aria-label={product.name}>
        <div className={styles.imageWrap}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{product.name}</h3>

          <div className={styles.priceRow}>
            {product.oldPrice ? (
              <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
            ) : null}
            <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </a>

      <button type="button" className={styles.addToCartBtn}>
        Add To Cart
      </button>
    </div>
  );
}

export default function GiftGuide() {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.section} aria-labelledby="gift-guide-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="gift-guide-heading" className={styles.heading}>
            You may also like
          </h2>

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

        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {GIFT_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}