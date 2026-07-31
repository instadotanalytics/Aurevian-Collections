// src/Components/NewCollections/NewCollections.jsx

import React, { useRef } from "react";
import {
  FiArrowRight,
  FiArrowLeft,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import styles from "./NewCollections.module.css";

// ==========================================================
// NEW COLLECTION IMAGES
// ==========================================================
const NEW_COLLECTION_IMAGES = {
  diamondNecklace:
    "https://i.pinimg.com/736x/c9/7e/9f/c97e9f9a6888e906eff403d2b703297c.jpg",
  goldRing:
    "https://i.pinimg.com/1200x/4d/94/ee/4d94ee4c9ac395cc0b8339b2aedd9fb1.jpg",
  emeraldEarrings:
    "https://i.pinimg.com/736x/7f/00/a0/7f00a0eed6732c3827f5a41a1f2a9c45.jpg",
  pearlBracelet:
    "https://i.pinimg.com/736x/b3/0a/b5/b30ab5738f474f74e01baddc9f11d9eb.jpg",
  sapphirePendant:
    "https://i.pinimg.com/736x/03/55/9c/03559cf6a40ba8d586b1c91aee84910a.jpg",
  rubyStuds:
    "https://i.pinimg.com/1200x/82/b8/a9/82b8a9520e7037d5de2cb82ce4896902.jpg",
  platinumBand:
    "https://i.pinimg.com/736x/4f/38/fb/4f38fba0d238d0d74979baa86abe77da.jpg",
  tanzaniteRing:
    "https://i.pinimg.com/736x/92/48/bc/9248bcb8e9b4cec255ea2f5dbf891209.jpg",
};

// ==========================================================
// NEW COLLECTION PRODUCT DATA
// ==========================================================
const NEW_PRODUCTS = [
  {
    id: "n1",
    name: "Diamond Halo Necklace",
    price: 12999,
    oldPrice: 16999,
    rating: 4.9,
    reviewCount: 124,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.diamondNecklace,
  },
  {
    id: "n2",
    name: "18K Gold Statement Ring",
    price: 8999,
    oldPrice: 11999,
    rating: 4.8,
    reviewCount: 98,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.goldRing,
  },
  {
    id: "n3",
    name: "Emerald Drop Earrings",
    price: 7499,
    oldPrice: 9999,
    rating: 4.7,
    reviewCount: 76,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.emeraldEarrings,
  },
  {
    id: "n4",
    name: "Freshwater Pearl Bracelet",
    price: 5499,
    oldPrice: 6999,
    rating: 4.6,
    reviewCount: 61,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.pearlBracelet,
  },
  {
    id: "n5",
    name: "Sapphire Pendant Set",
    price: 9999,
    oldPrice: 13999,
    rating: 4.9,
    reviewCount: 142,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.sapphirePendant,
  },
  {
    id: "n6",
    name: "Ruby Stud Earrings",
    price: 6499,
    oldPrice: 8499,
    rating: 4.7,
    reviewCount: 85,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.rubyStuds,
  },
  {
    id: "n7",
    name: "Platinum Wedding Band",
    price: 15999,
    oldPrice: 19999,
    rating: 4.9,
    reviewCount: 156,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.platinumBand,
  },
  {
    id: "n8",
    name: "Tanzanite Cocktail Ring",
    price: 11999,
    oldPrice: 15999,
    rating: 4.8,
    reviewCount: 103,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.tanzaniteRing,
  },
  {
    id: "n9",
    name: "Rose Gold Pendant",
    price: 7999,
    oldPrice: 10999,
    rating: 4.8,
    reviewCount: 91,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.diamondNecklace,
  },
  {
    id: "n10",
    name: "Silver Chain Bracelet",
    price: 4499,
    oldPrice: 5999,
    rating: 4.6,
    reviewCount: 54,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.pearlBracelet,
  },
  {
    id: "n11",
    name: "Pearl Stud Earrings",
    price: 3499,
    oldPrice: 4999,
    rating: 4.7,
    reviewCount: 67,
    collection: "Aurevian Collections",
    image: NEW_COLLECTION_IMAGES.rubyStuds,
  },
];

function Stars({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= Math.round(rating) ? (
        <FaStar key={i} className={styles.starIcon} />
      ) : (
        <FaRegStar key={i} className={styles.starIconEmpty} />
      ),
    );
  }
  return <div className={styles.stars}>{stars}</div>;
}

function ProductCard({ product }) {
  return (
    <div className={styles.card}>
      <span className={styles.newBadge}>NEW</span>

      <button
        type="button"
        className={styles.wishlistBtn}
        aria-label="Add to wishlist"
      >
        <FiHeart size={16} />
      </button>

      <a
        href={`/product/${product.id}`}
        className={styles.cardLink}
        aria-label={product.name}
      >
        <div className={styles.imageCircle}>
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
            <Stars rating={product.rating} />
            <span className={styles.ratingValue}>
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.oldPrice ? (
              <span className={styles.oldPrice}>
                ₹{product.oldPrice.toLocaleString("en-IN")}
              </span>
            ) : null}
          </div>
        </div>
      </a>

      <button type="button" className={styles.bagBtn} aria-label="Add to bag">
        <FiShoppingBag size={17} />
      </button>
    </div>
  );
}

export default function NewCollections() {
  const scrollContainerRef = useRef(null);

  const scrollByPage = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  const scrollLeft = () => scrollByPage(-1);
  const scrollRight = () => scrollByPage(1);

  return (
    <section
      className={styles.section}
      aria-labelledby="new-collections-heading"
    >
      <div className={styles.container}>
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
              <button
                type="button"
                className={styles.navBtn}
                onClick={scrollLeft}
                aria-label="Scroll left"
              >
                <FiArrowLeft size={15} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={scrollRight}
                aria-label="Scroll right"
              >
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
