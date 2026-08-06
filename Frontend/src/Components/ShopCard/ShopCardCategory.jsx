
// src/Components/ShopCardCategory/ShopCardCategory.jsx

import React, { useRef, useEffect, useState } from "react";
import { FiArrowRight, FiArrowLeft, FiHeart } from "react-icons/fi";
import styles from "./ShopCardCategory.module.css";

// ==========================================================
// JEWELLERY IMAGES (Unsplash - High Quality Jewellery Photos)
// ==========================================================
const JEWELLERY_IMAGES = {
  earrings: "https://i.pinimg.com/736x/5b/0e/08/5b0e08f53ecb685fc53a3177f700f11b.jpg",
  necklace: "https://img.staticdj.com/d163231c2f7292d419ed4cfba6a6c36c_2056x.jpeg",
  ring: "https://i.pinimg.com/736x/83/1a/6f/831a6ffce13568ce2ddff2d1a8e629fd.jpg",
  bracelet: "https://i.pinimg.com/736x/61/57/d5/6157d5bc2d28670ee98309576e6c861f.jpg",
  jhumka: "https://i.pinimg.com/736x/86/2b/06/862b06ece38f21324da94e01faaeed01.jpg",
  polki: "https://i.pinimg.com/736x/af/41/2a/af412a893dcdf665b50cbec0b4180814.jpg",
  anklet: "https://i.pinimg.com/736x/07/12/a0/0712a04f3d2139237226823ee10cf46a.jpg",
  nosepin: "https://i.pinimg.com/736x/be/d6/ca/bed6ca1d94b7cc31388bd8fe462250ff.jpg",
};

/* ------------------------------------------------------------------
   PRODUCT DATA
------------------------------------------------------------------ */
const PRODUCTS = [
  { id: "p1", name: "Zircon Drop Earrings", category: "Earrings", price: 1499, oldPrice: 2199, image: JEWELLERY_IMAGES.earrings },
  { id: "p2", name: "Kundan Choker Necklace", category: "Necklace", price: 3299, oldPrice: 4999, image: JEWELLERY_IMAGES.necklace },
  { id: "p3", name: "Rose Gold Band Ring", category: "Ring", price: 999, oldPrice: 1499, image: JEWELLERY_IMAGES.ring },
  { id: "p4", name: "Pearl Charm Bracelet", category: "Bracelet", price: 1799, oldPrice: 2499, image: JEWELLERY_IMAGES.bracelet },
  { id: "p5", name: "Temple Jhumka Earrings", category: "Earrings", price: 1299, oldPrice: 1999, image: JEWELLERY_IMAGES.jhumka },
  { id: "p6", name: "Bridal Polki Necklace Set", category: "Necklace", price: 7999, oldPrice: 11999, image: JEWELLERY_IMAGES.polki },
  { id: "p7", name: "Minimal Chain Anklet", category: "Anklet", price: 799, oldPrice: 1099, image: JEWELLERY_IMAGES.anklet },
  { id: "p8", name: "Diamond Cut Nose Pin", category: "Nose Pin", price: 599, oldPrice: 899, image: JEWELLERY_IMAGES.nosepin },
];

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
      <a href={`/product/${product.id}`} className={styles.cardLink} aria-label={product.name}>
        <div className={styles.frame}>
          <div className={styles.imageWrap}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className={styles.image}
                loading="lazy"
                draggable="false"
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
              <span className={styles.oldPrice}>₹{product.oldPrice.toLocaleString("en-IN")}</span>
            ) : null}
            <span className={styles.price}>₹{product.price.toLocaleString("en-IN")}</span>
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

export default function ShopCardCategory() {
  const scrollContainerRef = useRef(null);
  const [wishlist, setWishlist] = useState(() => new Set());

  // Drag-to-scroll (click + drag with the cursor, left to right)
  const dragState = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false });

  const scrollByAmount = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction * 260, behavior: "smooth" });
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
            <h3 className={styles.subHeading}>Here you can find the latest trending pieces!</h3>
          </div>

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
        </div>

        <div className={styles.scrollWrapper}>
          <div
            className={styles.scrollContainer}
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onClickCapture={handleClickCapture}
          >
            {PRODUCTS.map((product) => (
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
      </div>
    </section>
  );
}