
// src/Components/GiftGuide/GiftGuide.jsx
//
// Products come from FeaturedProduct entries (section: "curated-for-you"),
// fetched via fetchFeaturedProducts — same pattern as Offers.jsx. Wishlist
// + Add to Cart now wired to the same redux slices and auth-guard pattern
// used in Offers.jsx (toggleWishlistItem, addItemToCart, requireAuth +
// toast + navigate to /login). Header/Footer, ornament, layout, and card
// markup/classes are unchanged from the static version.

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiArrowLeft, FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import styles from "./GiftGuide.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";

import { fetchFeaturedProducts } from "../../redux/slices/featuredProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import { toggleWishlistItem } from "../../redux/slices/wishlistSlice";

const SECTION = "curated-for-you";

function ProductCard({
  product,
  isInCart,
  isInWishlist,
  cartLoading,
  onToggleWishlist,
  onAddToCart,
}) {
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product.id);
  };

  return (
    <div className={styles.card}>
      {/* Wishlist button lives OUTSIDE the clipped cardInner so the
          arch-shaped overflow:hidden never cuts it off */}
      <button
        type="button"
        className={`${styles.wishlistBtn} ${isInWishlist ? styles.wishlistBtnActive : ""}`}
        onClick={handleWishlistClick}
        aria-pressed={isInWishlist}
        aria-label={
          isInWishlist
            ? `Remove ${product.name} from wishlist`
            : `Add ${product.name} to wishlist`
        }
      >
        {isInWishlist ? (
          <FaHeart className={styles.wishlistIcon} />
        ) : (
          <FiHeart className={styles.wishlistIcon} />
        )}
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

        <button
          type="button"
          className={styles.addToCartBtn}
          onClick={handleAddToCartClick}
          aria-label={isInCart ? "Already in cart" : `Add ${product.name} to cart`}
          disabled={isInCart || cartLoading}
        >
          {isInCart ? "In Cart" : "Add To Cart"}
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
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const { products, isLoading, error } = useSelector(
    (state) =>
      state.featuredProducts.bySection[SECTION] || {
        products: [],
        isLoading: true,
        error: null,
      },
  );

  const [cartLoadingId, setCartLoadingId] = useState(null);

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

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/" } });
      return false;
    }
    return true;
  };

  const isInCart = (id) => cartItems.some((i) => i.product === id);
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.product?._id || i.product) === id);

  const handleToggleWishlist = (id) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(id)).catch(() => {});
  };

  const handleAddToCart = async (id) => {
    if (!requireAuth()) return;
    try {
      setCartLoadingId(id);
      await dispatch(addItemToCart({ productId: id, quantity: 1 })).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setCartLoadingId(null);
    }
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
                      isInCart={isInCart(product.id)}
                      isInWishlist={isInWishlist(product.id)}
                      cartLoading={cartLoadingId === product.id}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
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