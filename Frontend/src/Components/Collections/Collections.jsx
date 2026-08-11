// src/Components/Collections/Collections.jsx

import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiFilter, FiHeart, FiShoppingBag, FiCheck } from "react-icons/fi";
import { LuSlidersHorizontal } from "react-icons/lu";
import styles from "./Collections.module.css";
import Footer from "../../Pages/Layout/Footer/Footer.jsx";
import Header from "../../Pages/Layout/Header/Header.jsx";
import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

/* ----------------------------------------------------------------
   Data — Hero slides, features, categories, closing images (UNCHANGED)
------------------------------------------------------------------- */

const HERO_SLIDES = [
  {
    id: "hero-1",
    title: "Elegant Jewelry Collection",
    subtitle: "Handcrafted pieces for every occasion",
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop",
    tag: "New Collection",
  },
  {
    id: "hero-2",
    title: "The Royal Collection",
    subtitle: "Inspired by timeless elegance",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop",
    tag: "Featured",
  },
  {
    id: "hero-3",
    title: "Timeless Elegance",
    subtitle: "Designed to shine, made to last",
    img: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=1600&auto=format&fit=crop",
    tag: "Best Seller",
  },
  {
    id: "hero-4",
    title: "The Pearl Collection",
    subtitle: "Timeless beauty, modern grace",
    img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1600&auto=format&fit=crop",
    tag: "New Arrival",
  },
  {
    id: "hero-5",
    title: "Bridal Elegance",
    subtitle: "Celebrate your special day",
    img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1600&auto=format&fit=crop",
    tag: "Bridal",
  },
  {
    id: "hero-6",
    title: "Diamond Collection",
    subtitle: "Where brilliance meets artistry",
    img: "https://images.unsplash.com/photo-1747933509433-c58152c10ee7?q=80&w=1600&auto=format&fit=crop",
    tag: "Luxury",
  },
];

const FEATURES = [
  {
    title: "Premium Quality",
    body: "Crafted with care and the finest materials, piece by piece.",
  },
  {
    title: "Elegant & Versatile",
    body: "Perfect for every occasion, from quiet mornings to golden evenings.",
  },
  {
    title: "Made For You",
    body: "Timeless designs that celebrate your individuality.",
  },
];

const CATEGORIES = [
  {
    name: "Rings",
    img: "https://i.pinimg.com/736x/a6/82/3e/a6823e9da82914a4d82fc1523be67066.jpg",
  },
  {
    name: "Earrings",
    img: "https://i.pinimg.com/1200x/5e/76/04/5e76043e18239aa182fc3797456aecce.jpg",
  },
  {
    name: "Necklaces",
    img: "https://i.pinimg.com/736x/fe/9d/31/fe9d315a52ea2714c6205aa391e0580b.jpg",
  },
  {
    name: "Bracelets",
    img: "https://i.pinimg.com/736x/7e/91/71/7e9171bc17659925b95b79e6305418af.jpg",
  },
  {
    name: "Sets",
    img: "https://i.pinimg.com/736x/ea/d9/6e/ead96ee4a4e61acb305e11c6526ab172.jpg",
  },
];

const CLOSING_IMAGES = [
  "https://i.pinimg.com/736x/ea/96/8a/ea968ae6b41e6fd20cb2a1dac33c87ac.jpg",
  "https://i.pinimg.com/736x/ec/40/8f/ec408f13dd8ed46477aed4d7454c7fd9.jpg",
  "https://i.pinimg.com/1200x/b4/7e/e8/b47ee8ae94d4253ef2da698538ac5c81.jpg",
];

const FILTER_CATEGORIES = [
  "All",
  "Rings",
  "Earrings",
  "Necklaces",
  "Bracelets",
  "Anklets",
  "Bridal Sets",
];
const FILTER_MATERIALS = ["All", "Gold", "Silver", "Rose Gold", "Platinum"];
const FILTER_SIZES = ["All", "Small", "Medium", "Large"];

/* ----------------------------------------------------------------
   Persistent Reveal-on-scroll with Blur Effect (UNCHANGED)
------------------------------------------------------------------- */
function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px", ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, visible];
}

function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
  stagger = false,
  ...rest
}) {
  const [ref, visible] = useReveal();
  const staggerClass = stagger ? styles.revealStagger : "";

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${staggerClass} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default function Collections() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { byPlacement, isLoading } = useSelector(
    (state) => state.storefrontProduct,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const collectionsData = byPlacement.collections || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  const heroRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [cartLoadingId, setCartLoadingId] = useState(null);

  // Mobile filter sheet state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Products from Redux
  const products = collectionsData.products || [];
  const { total, totalPages: totalPagesFromAPI } =
    collectionsData.pagination || { total: 0, totalPages: 1 };

  // Fetch products when filters change
  useEffect(() => {
    dispatch(
      fetchProductsByPlacement({
        placement: "collections",
        page: currentPage,
        limit: itemsPerPage,
        categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
        sort: sortBy || undefined,
      }),
    );
  }, [dispatch, currentPage, selectedCategory, sortBy]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Auto-scroll for hero gallery
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Scroll hero to current slide
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const slideWidth = hero.offsetWidth;
    hero.scrollTo({ left: slideWidth * currentSlide, behavior: "smooth" });
  }, [currentSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 7000]);
    setCurrentPage(1);
  };

  const openMobileFilter = () => {
    setIsMobileFilterOpen(true);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${window.scrollY}px`;
  };

  const closeMobileFilter = () => {
    const scrollY = document.body.style.top;
    setIsMobileFilterOpen(false);
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/collections" } });
      return false;
    }
    return true;
  };

  const isInCart = (id) => cartItems.some((i) => i.product === id);
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.product?._id || i.product) === id);

  const toggleWishlist = (productId) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(productId)).catch(() => {});
  };

  const handleAddToCart = async (productId) => {
    if (!requireAuth()) return;
    try {
      setCartLoadingId(productId);
      await dispatch(addItemToCart({ productId, quantity: 1 })).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setCartLoadingId(null);
    }
  };

  // Scroll to filter section
  const scrollToFilter = () => {
    const newCollection = document.querySelector(
      `.${styles.newCollectionSection}`,
    );

    if (newCollection) {
      const newCollectionRect = newCollection.getBoundingClientRect();
      const newCollectionBottom = newCollectionRect.bottom + window.pageYOffset;

      window.scrollTo({
        top: newCollectionBottom - 300,
        behavior: "smooth",
      });
    } else {
      const filterSection = document.getElementById("filter-section");
      if (filterSection) {
        const rect = filterSection.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        window.scrollTo({
          top: absoluteTop - 40,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <>
      <Header />
      <section className={styles.collections} aria-label="Aurevian Collections">
        {/* ---------------- Hero Gallery - 90vh (UNCHANGED) ---------------- */}
        <div className={styles.heroGallery}>
          <div className={styles.heroTrack} ref={heroRef}>
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className={styles.heroSlide}
                onClick={scrollToFilter}
              >
                <img
                  src={slide.img}
                  alt={slide.title}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className={styles.heroOverlay}>
                  <div className={styles.heroOverlayContent}>
                    <span className={styles.heroTag}>{slide.tag}</span>
                    <h1 className={styles.heroTitle}>{slide.title}</h1>
                    <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                    <button
                      className={styles.heroBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToFilter();
                      }}
                    >
                      Shop Now <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation - Arrows at bottom center, dots next to arrows */}
          <div className={styles.heroNavWrapper}>
            <div className={styles.heroNavArrows}>
              <button
                className={styles.heroNavBtn}
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <div className={styles.heroDots}>
                {HERO_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ""}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <button
                className={styles.heroNavBtn}
                onClick={nextSlide}
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className={styles.container}>
          {/* ---------------- New Collection (UNCHANGED) ---------------- */}
          <Reveal
            as="section"
            className={styles.newCollectionSection}
            delay={100}
          >
            <div className={styles.newCollectionContent}>
              <span className={styles.newCollectionEyebrow}>
                New ✦ Collection
              </span>
              <h2 className={styles.newCollectionTitle}>Timeless Elegance</h2>
              <p className={styles.newCollectionDesc}>
                Each piece is crafted with precision and passion to reflect your
                unique style.
              </p>
            </div>
          </Reveal>

          {/* ---------------- Mobile Filter Toggle Button ---------------- */}
          <button
            type="button"
            className={styles.filterToggle}
            onClick={openMobileFilter}
            aria-expanded={isMobileFilterOpen}
          >
            <span className={styles.filterToggleText}>Filter Options</span>
            <span className={styles.filterToggleIcon}>
              <LuSlidersHorizontal />
            </span>
          </button>

          {/* ---------------- Shop Layout - Filter + Products ---------------- */}
          <div id="filter-section" className={styles.shopLayout}>
            {/* Desktop Filter Sidebar */}
            <Reveal as="aside" className={styles.filterSidebar} delay={100}>
              <h3 className={styles.filterTitle}>Filter</h3>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Category</span>
                {FILTER_CATEGORIES.map((cat) => (
                  <label key={cat} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Price Range</span>
                <input
                  type="range"
                  min="0"
                  max="7000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className={styles.filterPriceInput}
                  style={{ "--_progress": `${(priceRange[1] / 7000) * 100}%` }}
                />
                <div className={styles.filterPriceRange}>
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              <button
                className={styles.filterClearBtn}
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </Reveal>

            {/* Products */}
            <div className={styles.productsWrapper}>
              <div className={styles.productsHeader}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span className={styles.productsCount}>
                    {isLoading
                      ? "Loading..."
                      : `Showing ${products.length} of ${total} products`}
                  </span>
                </div>
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest">Sort by latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div className={styles.productsGrid}>
                {products.map((product) => {
                  const inCart = isInCart(product._id);
                  const inWishlist = isInWishlist(product._id);
                  const addingToCart = cartLoadingId === product._id;
                  const discount =
                    product.pricing?.salePrice && product.pricing?.originalPrice
                      ? Math.round(
                          ((product.pricing.originalPrice -
                            product.pricing.salePrice) /
                            product.pricing.originalPrice) *
                            100,
                        )
                      : 0;
                  return (
                    <Reveal
                      as="div"
                      key={product._id}
                      delay={50}
                      className={styles.productCard}
                    >
                      {/* navigate to product detail page */}
                      <Link
                        to={`/product/${product.productSlug}`}
                        className={styles.productImageWrap}
                      >
                        <img
                          className={styles.productImage}
                          src={product.thumbnail?.url}
                          alt={product.productName}
                          loading="lazy"
                        />
                        {discount > 0 && (
                          <span className={styles.productDiscount}>
                            {discount}% OFF
                          </span>
                        )}
                        <span className={styles.productCategoryOverlay}>
                          {product.category?.categoryData?.label ||
                            "Uncategorized"}
                        </span>
                        <div className={styles.wishlistActions}>
                          <button
                            type="button"
                            className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product._id);
                            }}
                            aria-label={
                              inWishlist
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                          >
                            {inWishlist ? (
                              <FiHeart fill="currentColor" />
                            ) : (
                              <FiHeart />
                            )}
                          </button>
                        </div>
                      </Link>
                      <div className={styles.productBody}>
                        {/* product name also links */}
                        <Link
                          to={`/product/${product.productSlug}`}
                          className={styles.productName}
                        >
                          {product.productName}
                        </Link>
                        <div className={styles.productPriceRow}>
                          <span className={styles.productCurrentPrice}>
                            ₹
                            {(
                              product.pricing?.salePrice ||
                              product.pricing?.originalPrice
                            )?.toLocaleString() || "0"}
                          </span>
                          {product.pricing?.salePrice &&
                            product.pricing?.originalPrice && (
                              <span className={styles.productOriginalPrice}>
                                ₹
                                {product.pricing.originalPrice.toLocaleString()}
                              </span>
                            )}
                        </div>
                        <button
                          type="button"
                          className={`${styles.productAddBtn} ${inCart ? styles.productAddBtnActive : ""}`}
                          onClick={() => handleAddToCart(product._id)}
                          disabled={inCart || addingToCart}
                        >
                          {inCart ? (
                            <>
                              <FiCheck /> Added to Cart
                            </>
                          ) : (
                            <>
                              <FiShoppingBag />{" "}
                              {addingToCart ? "Adding..." : "Add to Cart"}
                            </>
                          )}
                        </button>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPagesFromAPI > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.paginationBtn}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from(
                    { length: totalPagesFromAPI },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <button
                      key={n}
                      className={`${styles.pageBtn} ${n === currentPage ? styles.activePage : ""}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className={styles.paginationBtn}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPagesFromAPI),
                      )
                    }
                    disabled={currentPage === totalPagesFromAPI}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- From: Blush Set (UNCHANGED) ---------------- */}
          <div className={styles.featureSection}>
            <Reveal as="div" className={styles.featureImageWrap} delay={0}>
              <img
                className={styles.featureImage}
                src="https://i.pinimg.com/736x/07/ac/c1/07acc1c388356058bb35ea2b1bb7e8c9.jpg"
                alt="Model wearing the Blossom Set jewelry"
                loading="lazy"
              />
            </Reveal>

            <Reveal as="div" className={styles.featureContent} delay={150}>
              <span className={styles.pill}>From: Blush Set</span>
              <h3 className={styles.featureTitle}>
                Introducing The Blossom Set
              </h3>
              <p className={styles.featureBody}>
                Inspired by nature's delicate beauty, the Blossom Set brings a
                touch of freshness and femininity to your everyday look.
              </p>

              <ul className={styles.featureList}>
                {FEATURES.map((f, i) => (
                  <li className={styles.featureItem} key={f.title}>
                    <span className={styles.featureDot} aria-hidden="true">
                      ✦
                    </span>
                    <div>
                      <p className={styles.featureItemTitle}>{f.title}</p>
                      <p className={styles.featureItemBody}>{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={styles.ctaBtn}
                onClick={scrollToFilter}
              >
                Explore the Set <span>→</span>
              </button>
            </Reveal>
          </div>
        </div>

        {/* ---------------- Explore More - Larger Circles (UNCHANGED) ---------------- */}
        <Reveal as="div" className={styles.exploreSection} delay={100}>
          <div className={styles.container}>
            <div className={styles.exploreInner}>
              <div className={styles.exploreHeading}>
                <h3>Explore More</h3>
                <p>Find your perfect match.</p>
              </div>
              <div className={styles.exploreList}>
                {CATEGORIES.map((cat) => (
                  <div
                    className={styles.exploreItem}
                    key={cat.name}
                    onClick={scrollToFilter}
                  >
                    <span className={styles.exploreThumb}>
                      <img src={cat.img} alt="" loading="lazy" />
                    </span>
                    <span className={styles.exploreLabel}>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ---------------- Shine in your own way - At the End (UNCHANGED) ---------------- */}
        <div className={styles.container}>
          <div className={styles.closingSection}>
            <Reveal as="div" className={styles.closingContent} delay={100}>
              <h3 className={styles.closingTitle}>
                Shine in <em>your</em>
                <br />
                own way!
              </h3>
              <p className={styles.closingBody}>
                Jewelry that speaks your style.
              </p>
              <button
                type="button"
                className={styles.ctaBtn}
                onClick={scrollToFilter}
              >
                Explore the Collection <span>→</span>
              </button>
            </Reveal>

            <div className={styles.closingGallery}>
              {CLOSING_IMAGES.map((src, i) => (
                <Reveal
                  as="span"
                  key={src}
                  delay={i * 150 + 100}
                  className={styles.closingImgWrap}
                  onClick={scrollToFilter}
                >
                  <img src={src} alt="" loading="lazy" />
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- Mobile Bottom Sheet Filter ---------------- */}
        {isMobileFilterOpen && (
          <div className={styles.filterOverlay} onClick={closeMobileFilter} />
        )}

        <div
          className={`${styles.mobileFilterSheet} ${isMobileFilterOpen ? styles.mobileFilterSheetActive : ""}`}
        >
          <div className={styles.mobileFilterHandle} />

          <div className={styles.mobileFilterHeader}>
            <h3 className={styles.mobileFilterTitle}>Filter</h3>
            <button
              className={styles.mobileFilterClose}
              onClick={closeMobileFilter}
            >
              ✕
            </button>
          </div>

          <div className={styles.mobileFilterContent}>
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Category</span>
              {FILTER_CATEGORIES.map((cat) => (
                <label key={cat} className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            <button
              className={styles.mobileFilterApply}
              onClick={closeMobileFilter}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
