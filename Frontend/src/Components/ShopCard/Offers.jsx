// src/Components/Offers/Offers.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft, FiClock, FiZap } from "react-icons/fi";
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

// ==========================================================
// OFFERS PRODUCT DATA (swap for real/dynamic data later)
// ==========================================================
const OFFER_PRODUCTS = [
  { id: "o1", name: "Diwali Special Gold Set", price: 19999, oldPrice: 29999, discount: 33, offerTag: "Diwali Sale", image: OFFER_IMAGES.diwali },
  { id: "o2", name: "Summer Collection Rings", price: 6999, oldPrice: 9999, discount: 30, offerTag: "Summer Deal", image: OFFER_IMAGES.summer },
  { id: "o3", name: "Festive Gold Earrings", price: 8499, oldPrice: 12999, discount: 35, offerTag: "Festive Offer", image: OFFER_IMAGES.festive },
  { id: "o4", name: "Clearance Sale Pendants", price: 4499, oldPrice: 7499, discount: 40, offerTag: "Clearance", image: OFFER_IMAGES.clearance },
  { id: "o5", name: "Bridal Collection Offer", price: 15999, oldPrice: 21999, discount: 27, offerTag: "Bridal Special", image: OFFER_IMAGES.bridal },
  { id: "o6", name: "Anniversary Diamond Set", price: 12999, oldPrice: 18999, discount: 32, offerTag: "Anniversary Deal", image: OFFER_IMAGES.anniversary },
  { id: "o7", name: "Wedding Season Special", price: 24999, oldPrice: 34999, discount: 29, offerTag: "Wedding Season", image: OFFER_IMAGES.wedding },
  { id: "o8", name: "Gold Rate Discount", price: 8999, oldPrice: 12999, discount: 31, offerTag: "Gold Special", image: OFFER_IMAGES.gold },
];

function ProductCard({ product }) {
  const savings = product.oldPrice - product.price;

  return (
    <div className={styles.card}>
      <a href={`/product/${product.id}`} className={styles.cardLink} aria-label={product.name}>
        <div className={styles.imageWrap}>
          <span className={styles.offerTag}>{product.offerTag}</span>
          <span className={styles.discountBurst}>
            <span className={styles.discountNumber}>{product.discount}%</span>
            <span className={styles.discountLabel}>OFF</span>
          </span>

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

        {/* Perforated ticket seam */}
        <div className={styles.perforation} aria-hidden="true" />

        <div className={styles.info}>
          <h3 className={styles.title}>{product.name}</h3>

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
            <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
          </div>

          <div className={styles.savingsRow}>
            <FiZap className={styles.savingsIcon} />
            <span className={styles.savingsText}>Save ₹{savings.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </a>

      <button type="button" className={styles.grabBtn}>
        Grab This Deal
      </button>
    </div>
  );
}

export default function Offers() {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = end - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <section className={styles.section} aria-labelledby="offers-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.topText}>⚡ Limited Time</p>
            <h2 id="offers-heading" className={styles.heading}>
              Exclusive Offers
            </h2>
            <div className={styles.timerRow}>
              <FiClock className={styles.timerIcon} />
              <span className={styles.timerText}>
                Ends in <strong>{getTimeRemaining()}</strong>
              </span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <a href="/shop/offers" className={styles.viewAllBtn}>
              View All Offers
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

        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {OFFER_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}