// src/Components/GiftGuide/GiftGuide.jsx

import React, { useRef } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import styles from "./GiftGuide.module.css";

// ==========================================================
// GIFT GUIDE IMAGES
// ==========================================================
const GIFT_IMAGES = {
  anniversary: "https://i.pinimg.com/736x/e2/21/d1/e221d13ceba46a48f6a888619ec46bee.jpg",
  birthday: "https://i.pinimg.com/1200x/e2/b7/6d/e2b76d9671d9f32be67ebd5607b9d492.jpg",
  wedding: "https://i.pinimg.com/1200x/30/58/e7/3058e7390c75657800f3789f338e22f2.jpg",
  mother: "https://i.pinimg.com/1200x/9c/10/8c/9c108c17fecf903da4652be6d791bb18.jpg",
  valentine: "https://i.pinimg.com/736x/f2/18/09/f21809ec9a5932744cc577fbaa0bcb2f.jpg",
  festival: "https://i.pinimg.com/1200x/87/10/d5/8710d57ea02996eea94b2bb6a7f32948.jpg",
  graduation: "https://i.pinimg.com/1200x/57/f1/e1/57f1e1097725771838eb1991daf62b5d.jpg",
  corporate: "https://i.pinimg.com/736x/1f/54/a8/1f54a86cfbcef3888d7e85c05aca3dd4.jpg",
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