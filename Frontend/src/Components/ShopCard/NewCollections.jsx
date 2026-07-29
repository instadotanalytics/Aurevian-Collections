// src/Components/NewCollections/NewCollections.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import styles from "./NewCollections.module.css";

// ==========================================================
// NEW COLLECTION IMAGES
// ==========================================================
const NEW_COLLECTION_IMAGES = {
  diamondNecklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=625&fit=crop&crop=center&q=80",
  goldRing: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=625&fit=crop&crop=center&q=80",
  emeraldEarrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=625&fit=crop&crop=center&q=80",
  pearlBracelet: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=625&fit=crop&crop=center&q=80",
  sapphirePendant: "https://images.unsplash.com/photo-1611085583191-a3b181f3d6c0?w=500&h=625&fit=crop&crop=center&q=80",
  rubyStuds: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&h=625&fit=crop&crop=center&q=80",
  platinumBand: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=625&fit=crop&crop=center&q=80",
  tanzaniteRing: "https://images.unsplash.com/photo-1589128777073-4375663d2ed2?w=500&h=625&fit=crop&crop=center&q=80",
};

// ==========================================================
// NEW COLLECTION PRODUCT DATA (swap for real/dynamic data later)
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
];

function ProductCard({ product }) {
  return (
    <a href={`/product/${product.id}`} className={styles.card} aria-label={product.name}>
      <div className={styles.imageWrap}>
        <span className={styles.ribbon}>New</span>

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

      <div className={styles.body}>
        <p className={styles.collectionTag}>{product.collection}</p>
        <h3 className={styles.title}>{product.name}</h3>

        <div className={styles.metaRow}>
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

export default function NewCollections() {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section className={styles.section} aria-labelledby="new-collections-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.topText}>Fresh Arrivals</p>
            <h2 id="new-collections-heading" className={styles.heading}>
              New Collections
            </h2>
            <span className={styles.headingRule} aria-hidden="true" />
          </div>

          <div className={styles.headerActions}>
            <a href="/shop/new-arrivals" className={styles.viewAllBtn}>
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

        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {NEW_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}