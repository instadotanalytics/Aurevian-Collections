// src/Components/GiftGuide/GiftGuide.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft, FiGift } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
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
// GIFT GUIDE PRODUCT DATA
// ==========================================================
const GIFT_PRODUCTS = [
  { 
    id: "g1", 
    name: "Anniversary Diamond Set", 
    price: 15999, 
    oldPrice: 19999, 
    discount: 20, 
    rating: 4.9, 
    category: "Anniversary",
    image: GIFT_IMAGES.anniversary 
  },
  { 
    id: "g2", 
    name: "Birthstone Personalized Ring", 
    price: 8999, 
    oldPrice: 11999, 
    discount: 25, 
    rating: 4.8, 
    category: "Birthday",
    image: GIFT_IMAGES.birthday 
  },
  { 
    id: "g3", 
    name: "Bridal Polki Necklace", 
    price: 24999, 
    oldPrice: 32999, 
    discount: 24, 
    rating: 4.9, 
    category: "Wedding",
    image: GIFT_IMAGES.wedding 
  },
  { 
    id: "g4", 
    name: "Mother's Pearl Pendant", 
    price: 7499, 
    oldPrice: 9999, 
    discount: 25, 
    rating: 4.7, 
    category: "For Mother",
    image: GIFT_IMAGES.mother 
  },
  { 
    id: "g5", 
    name: "Heart-Shaped Ruby Pendant", 
    price: 12999, 
    oldPrice: 16999, 
    discount: 24, 
    rating: 4.8, 
    category: "Valentine's",
    image: GIFT_IMAGES.valentine 
  },
  { 
    id: "g6", 
    name: "Festival Gold Earrings", 
    price: 6499, 
    oldPrice: 8499, 
    discount: 24, 
    rating: 4.6, 
    category: "Festival",
    image: GIFT_IMAGES.festival 
  },
  { 
    id: "g7", 
    name: "Graduation Charm Bracelet", 
    price: 5499, 
    oldPrice: 6999, 
    discount: 21, 
    rating: 4.7, 
    category: "Graduation",
    image: GIFT_IMAGES.graduation 
  },
  { 
    id: "g8", 
    name: "Corporate Gifting Set", 
    price: 19999, 
    oldPrice: 25999, 
    discount: 23, 
    rating: 4.8, 
    category: "Corporate",
    image: GIFT_IMAGES.corporate 
  },
];

function ProductCard({ product }) {
  return (
    <a href={`/product/${product.id}`} className={styles.card} aria-label={product.name}>
      <div className={styles.imageWrap}>
        <span className={styles.categoryBadge}>{product.category}</span>
        {product.discount ? (
          <span className={styles.discountBadge}>{product.discount}% OFF</span>
        ) : null}

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
          {product.oldPrice ? (
            <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
          ) : null}
        </div>
      </div>
    </a>
  );
}

export default function GiftGuide() {
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

  return (
    <section className={styles.section} aria-labelledby="gift-guide-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.topText}>✦ PERFECT GIFT ✦</p>
            <h2 id="gift-guide-heading" className={styles.heading}>
              Gift Guide
            </h2>
            <p className={styles.subtitle}>Find the perfect piece for every occasion — curated with love</p>
          </div>

          <a href="/shop/gift-guide" className={styles.viewAllBtn}>
            View All
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
            {GIFT_PRODUCTS.map((product) => (
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