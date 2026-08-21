// src/Components/ShopCardCategory/ShopCardCategory.jsx
//
// Products come from FeaturedProduct entries (section: "trending-picks"),
// fetched via fetchFeaturedProducts — same pattern as GiftGuide.jsx /
// Offers.jsx. No hardcoded product data. Layout, card markup/classes,
// drag-to-scroll, and arrows are unchanged from the static version.

import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowRight, FiArrowLeft, FiHeart } from "react-icons/fi";
import styles from "./ShopCardCategory.module.css";

import { fetchFeaturedProducts } from "../../redux/slices/featuredProductSlice";

const SECTION = "trending-picks";

function ProductCard({ product, isWishlisted, onToggleWishlist, onAddToCart }) {
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    // NOTE: outer element is a plain div (not the link itself) so the
    // wishlist <button> and the "Add To Cart" <button> can live outside
    // the <a> — buttons can't be nested inside anchors in valid HTML.
    <div className={styles.card}>
      <a
        href={`/product/${product.slug}`}
        className={styles.cardLink}
        aria-label={product.name}
      >
        <div className={styles.frame}>
          <div className={styles.imageWrap}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className={styles.image}
                loading="lazy"
                draggable="false"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true" />
            )}
          </div>
          <span className={styles.cornerTL} aria-hidden="true" />
          <span className={styles.cornerBR} aria-hidden="true" />
        </div>

        <div className={styles.info}>
          <p className={styles.category}>{product.category}</p>
          <h3 className={styles.title}>{product.name}</h3>

          <div className={styles.priceRow}>
            {product.oldPrice ? (
              <span className={styles.oldPrice}>
                ₹{product.oldPrice.toLocaleString("en-IN")}
              </span>
            ) : null}
            <span className={styles.price}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </a>

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

      <button
        type="button"
        className={styles.addToCartBtn}
        onClick={handleAddToCartClick}
        aria-label={`Add ${product.name} to cart`}
      >
        Add To Cart
      </button>
    </div>
  );
}

// Skeleton reuses the card's own frame/imageWrap classes so it inherits the
// exact card dimensions, with a .skeletonPulse animation swapped in for the
// image (instead of the static "no image" .imagePlaceholder).
function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.frame}>
        <div className={styles.imageWrap}>
          <div className={styles.skeletonPulse} aria-hidden="true" />
        </div>
        <span className={styles.cornerTL} aria-hidden="true" />
        <span className={styles.cornerBR} aria-hidden="true" />
      </div>
      <div className={styles.info}>
        <p
          className={`${styles.category} ${styles.skeletonPulse} ${styles.skeletonText}`}
        >
          &nbsp;
        </p>
        <h3
          className={`${styles.title} ${styles.skeletonPulse} ${styles.skeletonText}`}
          style={{ maxWidth: "70%", margin: "0 auto" }}
        >
          &nbsp;
        </h3>
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
    category:
      product.category?.categoryData?.label ||
      product.category?.subCategoryData?.label ||
      "Jewellery",
    price: displayPrice || 0,
    oldPrice: hasDiscount ? product.pricing.originalPrice : null,
    image: product.thumbnail?.url || null,
  };
};

export default function ShopCardCategory() {
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

  const cardProducts = products.map(toCardProduct);
  const showEmptyState = !isLoading && !error && cardProducts.length === 0;

  // Drag-to-scroll (click + drag with the cursor, left to right)
  const dragState = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const scrollByAmount = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction * 260,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    dragState.current.isDown = true;
    dragState.current.moved = false;
    dragState.current.startX = e.pageX - el.offsetLeft;
    dragState.current.startScrollLeft = el.scrollLeft;
    el.classList.add(styles.dragging);
  };

  const endDrag = () => {
    const el = scrollContainerRef.current;
    dragState.current.isDown = false;
    if (el) el.classList.remove(styles.dragging);
  };

  const handleMouseMove = (e) => {
    const el = scrollContainerRef.current;
    if (!el || !dragState.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startScrollLeft - walk;
  };

  // Prevent the click from firing (and navigating) right after a drag
  const handleClickCapture = (e) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
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

  const handleAddToCart = (product) => {
    // Hook this up to your real cart logic/state/context as needed.
    console.log("Added to cart:", product);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onMouseLeave = () => endDrag();
    const onMouseUp = () => endDrag();
    el.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="shop-cards-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.topText}>✦ TRENDING PICKS ✦</p>
            <h2 id="shop-cards-heading" className={styles.heading}>
              Best Products For You
            </h2>
            <h3 className={styles.subHeading}>
              Here you can find the latest trending pieces!
            </h3>
          </div>

          {!showEmptyState && !error && (
            <div className={styles.navArrows}>
              <a href="/shop" className={styles.viewAllBtn}>
                View All
              </a>

              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={() => scrollByAmount(-1)}
                aria-label="Scroll left"
              >
                <FiArrowLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={() => scrollByAmount(1)}
                aria-label="Scroll right"
              >
                <FiArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {error ? (
          <p className={styles.stateMessage}>
            Couldn't load trending picks right now. Please try again later.
          </p>
        ) : showEmptyState ? (
          <p className={styles.stateMessage}>
            No trending picks yet — check back soon.
          </p>
        ) : (
          <div className={styles.scrollWrapper}>
            <div
              className={styles.scrollContainer}
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onClickCapture={handleClickCapture}
            >
              {isLoading
                ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
                : cardProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlist.has(product.id)}
                      onToggleWishlist={toggleWishlist}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
