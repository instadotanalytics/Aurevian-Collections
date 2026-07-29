
// src/Components/NewCollections/NewCollections.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
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
  // Adding 3 more products to show 4 products per row
  { id: "n9", name: "Rose Gold Pendant", price: 7999, oldPrice: 10999, rating: 4.8, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.diamondNecklace },
  { id: "n10", name: "Silver Chain Bracelet", price: 4499, oldPrice: 5999, rating: 4.6, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.pearlBracelet },
  { id: "n11", name: "Pearl Stud Earrings", price: 3499, oldPrice: 4999, rating: 4.7, collection: "Spring 2025", image: NEW_COLLECTION_IMAGES.rubyStuds },
];

function ProductCard({ product }) {
  return (
    <a href={`/product/${product.id}`} className={styles.card} aria-label={product.name}>
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

  // Scroll by exactly one "page" (the full visible width of the
  // container), so the grid always advances by a clean set of
  // cards — 4 on desktop, 3 on tablet, 2 on mobile.
  const scrollByPage = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  const scrollLeft = () => scrollByPage(-1);
  const scrollRight = () => scrollByPage(1);

  return (
    <section className={styles.section} aria-labelledby="new-collections-heading">
      <div className={styles.container}>
        {/* Two-column header:
            LEFT  → "Fresh Arrivals" (top line) + "New Collections" heading (below)
            RIGHT → "View All" button (top line) + arrow buttons (below)
            Because both columns simply stack top-to-bottom, the
            top lines naturally line up with each other, and so do
            the bottom lines — on every screen size. On mobile the
            arrows are hidden, so the right column is just the
            "View All" button sitting next to "Fresh Arrivals". */}
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

        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {NEW_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}