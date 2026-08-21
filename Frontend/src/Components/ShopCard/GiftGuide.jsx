// src/Components/GiftGuide/GiftGuide.jsx
//
// Products come from FeaturedProduct entries (section: "curated-for-you"),
// fetched via fetchFeaturedProducts — same pattern as Offers.jsx. No
// hardcoded product data. Header/Footer, ornament, layout, and card
// markup/classes are unchanged from the static version.

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowRight, FiArrowLeft, FiHeart } from "react-icons/fi";
import styles from "./GiftGuide.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";

import { fetchFeaturedProducts } from "../../redux/slices/featuredProductSlice";

const SECTION = "curated-for-you";

function ProductCard({ product, isWishlisted, onToggleWishlist }) {
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <div className={styles.card}>
      {/* Wishlist button lives OUTSIDE the clipped cardInner so the
          arch-shaped overflow:hidden never cuts it off */}
      <button
        type="button"
        className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ""}`}
        onClick={handleWishlistClick}
        aria-pressed={isWishlisted}
        aria-label={
          isWishlisted
            ? `Remove ${product.name} from wishlist`
            : `Add ${product.name} to wishlist`
        }
      >
        <FiHeart className={styles.wishlistIcon} />
      </button>

      <div className={styles.cardInner}>
        <a
          href={`/product/${product.slug}`}
          className={styles.cardLink}
          aria-label={product.name}
        >
          <div className={styles.imageWrap}>
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

          <div className={styles.content}>
            <h3 className={styles.title}>{product.name}</h3>

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

        <button type="button" className={styles.addToCartBtn}>
          Add To Cart
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.cardInner} ${styles.skeletonCard}`}>
        <div className={styles.imageWrap}>
          <div className={styles.skeletonImage} />
        </div>
        <div className={styles.content}>
          <div className={styles.skeletonLine} />
          <div
            className={`${styles.skeletonLine} ${styles.skeletonLineShort}`}
          />
        </div>
      </div>
    </div>
  );
}

// Maps a FeaturedProduct entry (entry.product = populated JewelleryProduct)
// to the flat shape ProductCard expects — keeps ProductCard's markup
// untouched from the static version.
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
    image: product.thumbnail?.url || null,
  };
};

export default function GiftGuide() {
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const [wishlist, setWishlist] = useState(() => new Set());

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

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const cardProducts = products.map(toCardProduct);
  const showEmptyState = !isLoading && !error && cardProducts.length === 0;

  return (
    <>
      <Header />

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

            {!showEmptyState && (
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
            )}
          </div>

          {error ? (
            <p className={styles.stateMessage}>
              Couldn't load this section right now. Please try again later.
            </p>
          ) : showEmptyState ? (
            <p className={styles.stateMessage}>
              No curated picks yet — check back soon.
            </p>
          ) : (
            <div className={styles.scrollContainer} ref={scrollContainerRef}>
              {isLoading
                ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
                : cardProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlist.has(product.id)}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
            </div>
          )}

          {/* --- VIEW ALL LINK AT BOTTOM --- */}
          <div className={styles.footerLink}>
            <a href="/gifts" className={styles.viewAllLink}>
              Explore All Gifts <FiArrowRight />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
