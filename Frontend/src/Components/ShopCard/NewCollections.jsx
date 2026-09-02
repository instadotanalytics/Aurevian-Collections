
// src/Components/NewCollections/NewCollections.jsx
//
// Products come from FeaturedProduct entries (section: "new-collections"),
// fetched via fetchFeaturedProducts — same pattern as ShopCardCategory.jsx /
// GiftGuide.jsx. No hardcoded product data. Layout, card markup/classes,
// and scroll behavior are unchanged from the static version. wishlistBtn
// and bagBtn remain static (no onClick/state) — that matches the original
// file, which never wired them up either.
//
// ✅ UPDATED: product title now matches the Shop page's product-name
// treatment exactly — same font (Jost, 500), same size/color, and the
// same single-line ellipsis truncation (via the shared truncateName
// helper, copied from Shop) instead of letting long names wrap to two
// lines. The star-rating row (stars + "0.0 (0)") has been removed
// entirely, since ratings aren't wired up to real data yet.

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowRight,
  FiArrowLeft,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import styles from "./NewCollections.module.css";

import { fetchFeaturedProducts } from "../../redux/slices/featuredProductSlice";

const SECTION = "new-collections";

// ✅ Same truncation rule as Shop's product cards — keep to 3 words max,
// full name still available via the title attribute for accessibility/hover.
const truncateName = (name) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length > 3) {
    return words.slice(0, 3).join(" ") + "...";
  }
  return name;
};

function ProductCard({ product }) {
  const displayName = truncateName(product.name);

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
        href={`/product/${product.slug}`}
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
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.collectionTag}>{product.collection}</p>
          <h3 className={styles.title} title={product.name}>
            {displayName}
          </h3>

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

// Skeleton reuses the card's own .card/.imageCircle/.body classes so it
// inherits the exact card shape (arched corners, gold backing edge, image
// medallion) with no new structural CSS needed — only .skeletonPulse /
// .skeletonText are new. Badge/wishlist/bag are omitted while loading.
function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.imageCircle}>
        <div className={styles.skeletonPulse} aria-hidden="true" />
      </div>
      <div className={styles.body}>
        <p
          className={`${styles.collectionTag} ${styles.skeletonPulse} ${styles.skeletonText}`}
          style={{ width: "55%", margin: "0 auto" }}
        >
          &nbsp;
        </p>
        <h3
          className={`${styles.title} ${styles.skeletonPulse} ${styles.skeletonText}`}
          style={{ width: "75%", height: "1.1em", margin: "0 auto" }}
        >
          &nbsp;
        </h3>
        <div className={styles.priceRow}>
          <span
            className={`${styles.price} ${styles.skeletonPulse} ${styles.skeletonText}`}
            style={{ width: "45%", margin: "0 auto" }}
          >
            &nbsp;
          </span>
        </div>
      </div>
    </div>
  );
}

// Maps a FeaturedProduct entry's populated JewelleryProduct doc to the flat
// shape ProductCard expects — keeps ProductCard's markup/classes untouched
// from the static version.
const toCardProduct = (product) => {
  const displayPrice =
    product.pricing?.salePrice || product.pricing?.originalPrice;
  const hasDiscount =
    product.pricing?.salePrice &&
    product.pricing?.salePrice < product.pricing?.originalPrice;

  return {
    id: product._id,
    slug: product.productSlug,
    name: product.productName,
    price: displayPrice || 0,
    oldPrice: hasDiscount ? product.pricing.originalPrice : null,
    collection: product.specifications?.collection || "Aurevian Collections",
    image: product.thumbnail?.url || null,
  };
};

export default function NewCollections() {
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);

  const { products, isLoading, error } = useSelector(
    (state) =>
      state.featuredProducts.bySection[SECTION] || {
        products: [],
        isLoading: true,
        error: null,
      },
  );

  useEffect(() => {
    dispatch(fetchFeaturedProducts(SECTION));
  }, [dispatch]);

  const cardProducts = products.map(toCardProduct);
  const showEmptyState = !isLoading && !error && cardProducts.length === 0;

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

          {!showEmptyState && !error && (
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
          )}
        </div>

        {error ? (
          <p className={styles.stateMessage}>
            Couldn't load new collections right now. Please try again later.
          </p>
        ) : showEmptyState ? (
          <p className={styles.stateMessage}>
            No new collections yet — check back soon.
          </p>
        ) : (
          <div className={styles.scrollContainer} ref={scrollContainerRef}>
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
              : cardProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}