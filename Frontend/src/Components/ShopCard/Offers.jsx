// src/Components/Offers/Offers.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft, FiTag, FiClock, FiZap } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import styles from "./Offers.module.css";

// ==========================================================
// OFFERS IMAGES
// ==========================================================
const OFFER_IMAGES = {
  diwali: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop&crop=center&q=80",
  summer: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop&crop=center&q=80",
  festive: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop&crop=center&q=80",
  clearance: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop&crop=center&q=80",
  bridal: "https://images.unsplash.com/photo-1611085583191-a3b181f3d6c0?w=500&h=500&fit=crop&crop=center&q=80",
  anniversary: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&h=500&fit=crop&crop=center&q=80",
  wedding: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=500&fit=crop&crop=center&q=80",
  gold: "https://images.unsplash.com/photo-1589128777073-4375663d2ed2?w=500&h=500&fit=crop&crop=center&q=80",
};

// ==========================================================
// OFFERS PRODUCT DATA
// ==========================================================
const OFFER_PRODUCTS = [
  { 
    id: "o1", 
    name: "Diwali Special Gold Set", 
    price: 19999, 
    oldPrice: 29999, 
    discount: 33, 
    rating: 4.9, 
    offerTag: "🔥 Diwali Sale",
    offerType: "festival",
    image: OFFER_IMAGES.diwali 
  },
  { 
    id: "o2", 
    name: "Summer Collection Rings", 
    price: 6999, 
    oldPrice: 9999, 
    discount: 30, 
    rating: 4.7, 
    offerTag: "☀️ Summer Deal",
    offerType: "seasonal",
    image: OFFER_IMAGES.summer 
  },
  { 
    id: "o3", 
    name: "Festive Gold Earrings", 
    price: 8499, 
    oldPrice: 12999, 
    discount: 35, 
    rating: 4.8, 
    offerTag: "🎉 Festive Offer",
    offerType: "festival",
    image: OFFER_IMAGES.festive 
  },
  { 
    id: "o4", 
    name: "Clearance Sale - Pendants", 
    price: 4499, 
    oldPrice: 7499, 
    discount: 40, 
    rating: 4.6, 
    offerTag: "⚡ Clearance",
    offerType: "clearance",
    image: OFFER_IMAGES.clearance 
  },
  { 
    id: "o5", 
    name: "Bridal Collection Offer", 
    price: 15999, 
    oldPrice: 21999, 
    discount: 27, 
    rating: 4.9, 
    offerTag: "💍 Bridal Special",
    offerType: "bridal",
    image: OFFER_IMAGES.bridal 
  },
  { 
    id: "o6", 
    name: "Anniversary Diamond Set", 
    price: 12999, 
    oldPrice: 18999, 
    discount: 32, 
    rating: 4.8, 
    offerTag: "❤️ Anniversary Deal",
    offerType: "anniversary",
    image: OFFER_IMAGES.anniversary 
  },
  { 
    id: "o7", 
    name: "Wedding Season Special", 
    price: 24999, 
    oldPrice: 34999, 
    discount: 29, 
    rating: 4.9, 
    offerTag: "💒 Wedding Season",
    offerType: "wedding",
    image: OFFER_IMAGES.wedding 
  },
  { 
    id: "o8", 
    name: "Gold Rate Discount", 
    price: 8999, 
    oldPrice: 12999, 
    discount: 31, 
    rating: 4.7, 
    offerTag: "✨ Gold Special",
    offerType: "gold",
    image: OFFER_IMAGES.gold 
  },
];

function ProductCard({ product }) {
  return (
    <a href={`/product/${product.id}`} className={styles.card} aria-label={product.name}>
      <div className={styles.imageWrap}>
        {/* Offer Tag Banner */}
        <div className={styles.offerBanner}>
          <FiTag className={styles.offerIcon} />
          <span className={styles.offerTagText}>{product.offerTag}</span>
        </div>
        
        {/* Discount Badge */}
        <div className={styles.discountBadge}>
          <span className={styles.discountNumber}>{product.discount}%</span>
          <span className={styles.discountLabel}>OFF</span>
        </div>

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

      <div className={styles.info}>
        <h3 className={styles.title}>{product.name}</h3>

        <div className={styles.ratingRow}>
          <FaStar className={styles.starIcon} />
          <span className={styles.ratingValue}>{product.rating.toFixed(1)}</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
          <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
        </div>

        <div className={styles.savingsRow}>
          <FiZap className={styles.savingsIcon} />
          <span className={styles.savingsText}>Save ₹{(product.oldPrice - product.price).toLocaleString("en-IN")}</span>
        </div>
      </div>
    </a>
  );
}

export default function Offers() {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  // Calculate time remaining (dummy data for demo)
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
            <p className={styles.topText}>✦ LIMITED TIME ✦</p>
            <h2 id="offers-heading" className={styles.heading}>
              Exclusive Offers
            </h2>
            <div className={styles.timerRow}>
              <FiClock className={styles.timerIcon} />
              <span className={styles.timerText}>Ends in: <strong>{getTimeRemaining()}</strong></span>
            </div>
          </div>

          <a href="/shop/offers" className={styles.viewAllBtn}>
            View All Offers
            <FiArrowRight className={styles.viewAllIcon} />
          </a>
        </div>

        {/* Scroll Container */}
        <div className={styles.scrollWrapper}>
          {/* Desktop Arrow Buttons */}
          <button 
            className={`${styles.scrollBtn} ${styles.scrollLeftBtn}`} 
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <FiArrowLeft size={20} />
          </button>
          
          <button 
            className={`${styles.scrollBtn} ${styles.scrollRightBtn}`} 
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <FiArrowRight size={20} />
          </button>

          <div className={styles.scrollContainer} ref={scrollContainerRef}>
            {OFFER_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Divider Line */}
        <div className={styles.dividerLine} aria-hidden="true" />
      </div>
    </section>
  );
}