

// Like.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiX,
  FiEye,
  FiShoppingBag,
  FiSliders,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheck,
} from "react-icons/fi";
import { FaHeart, FaStar, FaRegStar } from "react-icons/fa";
import styles from "./Wishlist.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

/* ============================================================
   Aurevian Collection — Wishlist
   ============================================================ */

const INITIAL_WISHLIST = [
  {
    id: "wl-01",
    name: "Aurelia Diamond Solitaire Necklace",
    description: "18k gold vermeil, lab-grown diamond",
    category: "Necklaces",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80&auto=format&fit=crop",
    price: 4999,
    oldPrice: 6499,
    rating: 4.8,
    reviews: 214,
    badge: "BESTSELLER",
    stock: "In Stock",
    dateAdded: 8,
  },
  {
    id: "wl-02",
    name: "Celeste Pearl Drop Earrings",
    description: "Freshwater pearl, gold-plated hoop",
    category: "Earrings",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80&auto=format&fit=crop",
    price: 2299,
    oldPrice: null,
    rating: 4.6,
    reviews: 98,
    badge: "NEW",
    stock: "In Stock",
    dateAdded: 9,
  },
  {
    id: "wl-03",
    name: "Ouroboros Serpent Ring",
    description: "Sculpted 18k gold, sapphire eyes",
    category: "Rings",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80&auto=format&fit=crop",
    price: 3499,
    oldPrice: 3999,
    rating: 4.9,
    reviews: 156,
    badge: "LIMITED",
    stock: "Only 2 Left",
    dateAdded: 7,
  },
  {
    id: "wl-04",
    name: "Eternal Vow Wedding Band Set",
    description: "Matched pair, brushed 18k gold",
    category: "Rings",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80&auto=format&fit=crop",
    price: 7999,
    oldPrice: 9999,
    rating: 4.7,
    reviews: 312,
    badge: "SALE",
    stock: "In Stock",
    dateAdded: 4,
  },
  {
    id: "wl-05",
    name: "Whisper Gold Chain Bracelet",
    description: "Delicate curb chain, adjustable",
    category: "Bracelets",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80&auto=format&fit=crop",
    price: 1899,
    oldPrice: null,
    rating: 4.5,
    reviews: 67,
    badge: null,
    stock: "In Stock",
    dateAdded: 6,
  },
  {
    id: "wl-06",
    name: "Belle Heart Pendant",
    description: "Petite pendant, 16in cable chain",
    category: "Necklaces",
    image:
      "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80&auto=format&fit=crop",
    price: 2799,
    oldPrice: 3299,
    rating: 4.4,
    reviews: 45,
    badge: null,
    stock: "Only 3 Left",
    dateAdded: 3,
  },
  {
    id: "wl-07",
    name: "Golden Twist Hoop Earrings",
    description: "Textured 18k gold, medium hoop",
    category: "Earrings",
    image:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80&auto=format&fit=crop",
    price: 1699,
    oldPrice: null,
    rating: 4.3,
    reviews: 29,
    badge: "NEW",
    stock: "In Stock",
    dateAdded: 10,
  },
  {
    id: "wl-08",
    name: "Vintage Gold Statement Ring",
    description: "Antique-finish band, cocktail cut",
    category: "Rings",
    image:
      "https://plus.unsplash.com/premium_photo-1671641737553-3d669dc1f927?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2999,
    oldPrice: 3599,
    rating: 4.6,
    reviews: 88,
    badge: "SALE",
    stock: "In Stock",
    dateAdded: 2,
  },
];

const RECOMMENDED = [
  {
    id: "rec-01",
    name: "Solene Tennis Bracelet",
    price: 5499,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=80&auto=format&fit=crop",
  },
  {
    id: "rec-02",
    name: "Marielle Stud Earrings",
    price: 1499,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80&auto=format&fit=crop",
  },
  {
    id: "rec-03",
    name: "Reverie Layered Necklace",
    price: 3299,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80&auto=format&fit=crop",
  },
  {
    id: "rec-04",
    name: "Noor Signet Ring",
    price: 2199,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80&auto=format&fit=crop",
  },
  {
    id: "rec-05",
    name: "Aster Hoop Duo",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&q=80&auto=format&fit=crop",
  },
  {
    id: "rec-06",
    name: "Luna Pendant Necklace",
    price: 2799,
    image:
      "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=500&q=80&auto=format&fit=crop",
  },
];

const CATEGORIES = ["All", "Necklaces", "Rings", "Earrings", "Bracelets"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "mostLoved", label: "Most Loved" },
];

function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= Math.round(rating) ? (
        <FaStar key={i} className={styles.starFilled} />
      ) : (
        <FaRegStar key={i} className={styles.starEmpty} />
      )
    );
  }
  return <div className={styles.stars}>{stars}</div>;
}

function StatCard({ icon, value, label }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureText}>{text}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`${styles.skeletonBlock} ${styles.skeletonImage}`} />
      <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
      <div
        className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLineShort}`}
      />
      <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
    </div>
  );
}

function ProductCard({ item, viewMode, onRemove, onMoveToCart }) {
  const discount = item.oldPrice
    ? Math.round((1 - item.price / item.oldPrice) * 100)
    : 0;
  const isLowStock = item.stock !== "In Stock";

  return (
    <article
      className={`${styles.card} ${
        viewMode === "list" ? styles.cardList : ""
      }`}
    >
      <div className={styles.cardMedia}>
        {item.badge && (
          <span
            className={`${styles.badge} ${styles["badge_" + item.badge]}`}
          >
            {item.badge}
          </span>
        )}

        <button
          type="button"
          className={styles.heartBtn}
          aria-label="Saved to wishlist"
        >
          <FaHeart />
        </button>

        <button
          type="button"
          className={styles.removeIconBtn}
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          <FiX />
        </button>

        <img
          src={item.image}
          alt={item.name}
          className={styles.cardImage}
          loading="lazy"
        />
        <div className={styles.cardGradient} />

        <div className={styles.quickView}>
          <button type="button" className={styles.quickViewBtn}>
            <FiEye /> View Details
          </button>
          <button
            type="button"
            className={styles.quickViewBtnPrimary}
            onClick={() => onMoveToCart(item.id)}
          >
            <FiShoppingBag /> Move to Cart
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{item.name}</h3>
        <p className={styles.cardDesc}>{item.description}</p>

        <div className={styles.cardRating}>
          <StarRating rating={item.rating} />
          <span className={styles.reviewCount}>({item.reviews})</span>
        </div>

        <div className={styles.cardPriceRow}>
          <span className={styles.price}>{formatINR(item.price)}</span>
          {item.oldPrice && (
            <>
              <span className={styles.oldPrice}>
                {formatINR(item.oldPrice)}
              </span>
              <span className={styles.discountTag}>-{discount}%</span>
            </>
          )}
        </div>

        <p
          className={`${styles.stockText} ${
            isLowStock ? styles.stockLow : styles.stockOk
          }`}
        >
          {isLowStock ? item.stock : "In Stock"}
        </p>

        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.btnMoveToCart}
            onClick={() => onMoveToCart(item.id)}
          >
            <FiShoppingBag /> Move to Cart
          </button>
          <button
            type="button"
            className={styles.btnRemove}
            onClick={() => onRemove(item.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Like() {
  const [items, setItems] = useState(INITIAL_WISHLIST);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [toast, setToast] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const visibleItems = useMemo(() => {
    let list = [...items];
    if (category !== "All") {
      list = list.filter((item) => item.category === category);
    }
    switch (sortBy) {
      case "priceLow":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        list.sort((a, b) => b.price - a.price);
        break;
      case "mostLoved":
        list.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        list.sort((a, b) => b.dateAdded - a.dateAdded);
    }
    return list;
  }, [items, category, sortBy]);

  function removeItem(id) {
    const removed = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (removed) {
      setToast(`${removed.name} removed from wishlist`);
    }
  }

  function moveToCart(id) {
    const moved = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (moved) {
      setToast(`${moved.name} moved to your bag`);
    }
  }

  function scrollRecommended(direction) {
    const node = scrollerRef.current;
    if (!node) return;
    const cardWidth = 200 + 16;
    const scrollAmount = direction === "left" ? -cardWidth * 3 : cardWidth * 3;
    node.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }

  const isEmpty = !loading && items.length === 0;

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Your Wishlist</h1>
            </div>
          
          </header>

          {isEmpty ? (
            <section className={styles.emptyState}>
              <div className={styles.emptyIllustration}>
                <FaHeart className={styles.emptyHeart} />
              </div>
              <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
              <p className={styles.emptyText}>
                Discover timeless jewellery crafted for every moment.
              </p>
              <a className={styles.emptyCta} href="/shop">
                Explore Collection
              </a>
            </section>
          ) : (
            <>
              
              {/* Toolbar */}
              <section className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                
                  {filterOpen && (
                    <div className={styles.chipRow}>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`${styles.chip} ${
                            category === cat ? styles.chipActive : ""
                          }`}
                          onClick={() => setCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.toolbarRight}>
                

        
                </div>
              </section>

              {/* Grid */}
              <section
                className={`${styles.grid} ${
                  viewMode === "list" ? styles.gridList : ""
                }`}
              >
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  : visibleItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onRemove={removeItem}
                        onMoveToCart={moveToCart}
                      />
                    ))}
              </section>

              {!loading && visibleItems.length === 0 && (
                <p className={styles.noResults}>
                  No pieces match this filter — try another category.
                </p>
              )}
            </>
          )}

          {/* Recommended */}
          <section className={styles.recommended}>
            <div className={styles.recommendedHead}>
              <h2 className={styles.recommendedTitle}>You May Also Love</h2>
              <div className={styles.recommendedArrows}>
                <button
                  type="button"
                  className={styles.arrowBtn}
                  onClick={() => scrollRecommended("left")}
                  aria-label="Scroll left"
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className={styles.arrowBtn}
                  onClick={() => scrollRecommended("right")}
                  aria-label="Scroll right"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className={styles.recommendedScroller} ref={scrollerRef}>
              {RECOMMENDED.map((item) => (
                <div className={styles.recCard} key={item.id}>
                  <div className={styles.recImageWrap}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.recImage}
                      loading="lazy"
                    />
                  </div>
                  <h3 className={styles.recName}>{item.name}</h3>
                  <span className={styles.recPrice}>
                    {formatINR(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          
        </div>

        {/* Footer Banner */}
        <section className={styles.footerBanner}>
          <span className={`${styles.sparkle} ${styles.sparkle1}`} />
          <span className={`${styles.sparkle} ${styles.sparkle2}`} />
          <span className={`${styles.sparkle} ${styles.sparkle3}`} />
          <span className={`${styles.sparkle} ${styles.sparkle4}`} />
        </section>

        {toast && (
          <div className={styles.toast} role="status">
            {toast}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}