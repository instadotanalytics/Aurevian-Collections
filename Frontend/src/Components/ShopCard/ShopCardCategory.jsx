// src/Components/ShopCardCategory/ShopCardCategory.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import styles from "./ShopCardCategory.module.css";

// ==========================================================
// JEWELLERY IMAGES (Unsplash - High Quality Jewellery Photos)
// ==========================================================
const JEWELLERY_IMAGES = {
  earrings: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&h=500&fit=crop&crop=center&q=80",
  necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop&crop=center&q=80",
  ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop&crop=center&q=80",
  bracelet: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop&crop=center&q=80",
  jhumka: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop&crop=center&q=80",
  polki: "https://images.unsplash.com/photo-1611085583191-a3b181f3d6c0?w=500&h=500&fit=crop&crop=center&q=80",
  anklet: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=500&fit=crop&crop=center&q=80",
  nosepin: "https://images.unsplash.com/photo-1589128777073-4375663d2ed2?w=500&h=500&fit=crop&crop=center&q=80",
};

/* ------------------------------------------------------------------
   PRODUCT DATA WITH IMAGES
------------------------------------------------------------------ */
const PRODUCTS = [
  { 
    id: "p1", 
    name: "Zircon Drop Earrings", 
    price: 1499, 
    oldPrice: 2199, 
    discount: 32, 
    rating: 4.8, 
    image: JEWELLERY_IMAGES.earrings 
  },
  { 
    id: "p2", 
    name: "Kundan Choker Necklace", 
    price: 3299, 
    oldPrice: 4999, 
    discount: 34, 
    rating: 4.9, 
    image: JEWELLERY_IMAGES.necklace 
  },
  { 
    id: "p3", 
    name: "Rose Gold Band Ring", 
    price: 999, 
    oldPrice: 1499, 
    discount: 33, 
    rating: 4.7, 
    image: JEWELLERY_IMAGES.ring 
  },
  { 
    id: "p4", 
    name: "Pearl Charm Bracelet", 
    price: 1799, 
    oldPrice: 2499, 
    discount: 28, 
    rating: 4.6, 
    image: JEWELLERY_IMAGES.bracelet 
  },
  { 
    id: "p5", 
    name: "Temple Jhumka Earrings", 
    price: 1299, 
    oldPrice: 1999, 
    discount: 35, 
    rating: 4.8, 
    image: JEWELLERY_IMAGES.jhumka 
  },
  { 
    id: "p6", 
    name: "Bridal Polki Necklace Set", 
    price: 7999, 
    oldPrice: 11999, 
    discount: 33, 
    rating: 5.0, 
    image: JEWELLERY_IMAGES.polki 
  },
  { 
    id: "p7", 
    name: "Minimal Chain Anklet", 
    price: 799, 
    oldPrice: 1099, 
    discount: 27, 
    rating: 4.5, 
    image: JEWELLERY_IMAGES.anklet 
  },
  { 
    id: "p8", 
    name: "Diamond Cut Nose Pin", 
    price: 599, 
    oldPrice: 899, 
    discount: 33, 
    rating: 4.7, 
    image: JEWELLERY_IMAGES.nosepin 
  },
];

function ProductCard({ product }) {
  return (
    <a href={`/product/${product.id}`} className={styles.card} aria-label={product.name}>
      <div className={styles.imageWrap}>
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

export default function ShopCardCategory() {
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
    <section className={styles.section} aria-labelledby="shop-cards-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.topText}>✦ TRENDING PICKS ✦</p>
            <h2 id="shop-cards-heading" className={styles.heading}>
              Best Products For You
            </h2>
          </div>

          <a href="/shop" className={styles.viewAllBtn}>
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
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}