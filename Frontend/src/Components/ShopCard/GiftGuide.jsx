// src/Components/GiftGuide/GiftGuide.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import styles from "./GiftGuide.module.css";

// ==========================================================
// GIFT GUIDE IMAGES
// ==========================================================
const GIFT_IMAGES = {
  anniversary: "https://i.pinimg.com/736x/79/2e/f6/792ef645e1894c2cb98676e5aed731ad.jpg",
  birthday: "https://i.pinimg.com/736x/45/7c/e0/457ce04c1cc92d108ff50fa4a6ba14cf.jpg",
  wedding: "https://i.pinimg.com/1200x/d7/95/e2/d795e2303a83dfb54c436fad106f8dc3.jpg",
  mother: "https://i.pinimg.com/736x/57/7f/3f/577f3ff1942409edf18da447c0842225.jpg",
  valentine: "https://i.pinimg.com/736x/a4/74/c4/a474c4bb477e5696072f392f0a4c6027.jpg",
  festival: "https://i.pinimg.com/736x/a8/0e/00/a80e0090db41c1c3347c6498ce7a848a.jpg",
  graduation: "https://i.pinimg.com/736x/f9/87/0a/f9870a91c638d49b37cbb40ae7f28af6.jpg",
  corporate: "https://i.pinimg.com/736x/0e/ca/bd/0ecabde96898be93f8f3ef86a40cbf90.jpg",
};

// ==========================================================
// GIFT GUIDE PRODUCT DATA
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
            <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
            {product.oldPrice ? (
              <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
            ) : null}
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
        
        {/* --- DECORATIVE TOP ORNAMENT --- */}
        <div className={styles.topOrnament} aria-hidden="true">
          <span className={styles.ornamentLine}></span>
          <span className={styles.ornamentDiamond}>✦</span>
          <span className={styles.ornamentLine}></span>
        </div>

        <div className={styles.header}>
          <div className={styles.headingWrapper}>
            <span className={styles.subHeading}>Curated for you</span>
            <h2 id="gift-guide-heading" className={styles.heading}>
              You May Also Like
            </h2>
          </div>

          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <FiArrowLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <FiArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {GIFT_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* --- VIEW ALL LINK AT BOTTOM --- */}
        <div className={styles.footerLink}>
          <a href="/gifts" className={styles.viewAllLink}>
            Explore All Gifts <FiArrowRight />
          </a>
        </div>

      </div>
    </section>
  );
}