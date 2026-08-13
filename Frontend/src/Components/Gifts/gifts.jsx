// src/Pages/Gifts/Gifts.jsx

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./gifts.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";
import giftHero from "../../assets/heroimageg.png";
import giftMiddle from "../../assets/giftmiddle.png";

import {
  FiGift,
  FiCheck,
  FiHeart,
  FiStar,
  FiShoppingBag,
  FiChevronDown,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { LuSlidersHorizontal } from "react-icons/lu";

import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";

const jewelHighlights = [
  ["Brilliant Cut Quality", "Natural Color Grade"],
  ["High Clarity Rating", "Precise Carat Weight"],
  ["Elegant Setting Style", "Durable Metal Choice"],
];

/* ---------- Filter data ---------- */
const FILTER_CATEGORIES = [
  "All",
  "Anniversary",
  "Birthday",
  "Wedding",
  "Valentine's Day",
  "Mother's Day",
  "Just Because",
];

const FILTER_RECIPIENTS = ["All", "For Her", "For Him", "For Couples", "For Kids"];

const FILTER_BUDGETS = ["All", "Under ₹1,000", "₹1,000 – ₹3,000", "₹3,000 – ₹6,000", "Above ₹6,000"];

const FILTER_PROMOTIONS = ["All", "Gift Wrapped", "Best Seller", "Trending", "Premium Gift"];

const FILTER_AVAILABILITY = ["All", "In Stock", "Out of Stock"];

const SORT_OPTIONS = [
  { value: "latest", label: "Sort by latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const testimonials = [
  {
    name: "Ananya R.",
    initials: "AR",
    rating: 5,
    quote: "This necklace exceeded every expectation!",
  },
  {
    name: "Kabir M.",
    initials: "KM",
    rating: 5,
    quote: "Finally found gifts that feel truly personal.",
  },
  {
    name: "Simran K.",
    initials: "SK",
    rating: 4,
    quote: "Elegant packaging, exactly as pictured.",
  },
];

const perks = [
  {
    icon: "🎁",
    title: "Free Gift Wrapping",
    text: "Every gift order wrapped at no extra cost",
  },
  {
    icon: "💌",
    title: "Personalised Note",
    text: "Add a free handwritten message card",
  },
  {
    icon: "🔄",
    title: "Easy Exchange",
    text: "Hassle-free exchange within 15 days",
  },
];

export default function Gifts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { byPlacement, isLoading } = useSelector(
    (state) => state.storefrontProduct,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const giftsData = byPlacement.gifts || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRecipient, setSelectedRecipient] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("All");
  const [selectedPromotion, setSelectedPromotion] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 8000]);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [cartLoadingId, setCartLoadingId] = useState(null);

  // Mobile filter sheet state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Custom dropdown state
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  const products = giftsData.products || [];
  const { total, totalPages } = giftsData.pagination || {
    total: 0,
    totalPages: 1,
  };

  // Fetch products when filters change
  useEffect(() => {
    dispatch(
      fetchProductsByPlacement({
        placement: "gifts",
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/gifts" } });
      return false;
    }
    return true;
  };

  const isInCart = (id) => cartItems.some((i) => i.product === id);
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.product?._id || i.product) === id);

  const toggleWishlist = (id) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(id)).catch(() => {});
  };

  const addToCart = async (id) => {
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

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedRecipient("All");
    setSelectedBudget("All");
    setSelectedPromotion("All");
    setSelectedAvailability("All");
    setPriceRange([0, 8000]);
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

  const handleSortSelect = (value) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.value === sortBy);
    return option ? option.label : "Sort by latest";
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.mainContent}>
          {/* ================= HERO ================= */}
          <section className={styles.hero}>
            <img
              src={giftHero}
              alt="Timeless gifts for every celebration"
              className={styles.heroImage}
            />
          </section>

          {/* ================= GIFT SHOP BODY ================= */}
          <div className={styles.shopWrap} id="shopSection">
            {/* ---------- Mobile Filter Toggle Button ---------- */}
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

            {/* ---------- Mobile backdrop ---------- */}
            {isMobileFilterOpen && (
              <div
                className={styles.filterOverlay}
                onClick={closeMobileFilter}
              />
            )}

            {/* ---------- Desktop Filter Sidebar ---------- */}
            <aside className={styles.filters}>
              <h3 className={styles.filtersHeading}>Filter</h3>

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
                <span className={styles.filterGroupLabel}>Recipient</span>
                {FILTER_RECIPIENTS.map((r) => (
                  <label key={r} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="recipient"
                      checked={selectedRecipient === r}
                      onChange={() => setSelectedRecipient(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Budget</span>
                {FILTER_BUDGETS.map((b) => (
                  <label key={b} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="budget"
                      checked={selectedBudget === b}
                      onChange={() => setSelectedBudget(b)}
                    />
                    {b}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Price Range</span>
                <input
                  type="range"
                  min="0"
                  max="8000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className={styles.filterPriceInput}
                  style={{ "--_progress": `${(priceRange[1] / 8000) * 100}%` }}
                />
                <div className={styles.filterPriceRange}>
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Promotions</span>
                {FILTER_PROMOTIONS.map((p) => (
                  <label key={p} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="promotion"
                      checked={selectedPromotion === p}
                      onChange={() => setSelectedPromotion(p)}
                    />
                    {p}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Availability</span>
                {FILTER_AVAILABILITY.map((a) => (
                  <label key={a} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="availability"
                      checked={selectedAvailability === a}
                      onChange={() => setSelectedAvailability(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>

              <button
                className={styles.filterClearBtn}
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </aside>

            {/* ---------- Product Listing ---------- */}
            <main className={styles.productsWrapper}>
              <div className={styles.toolbar}>
                <span className={styles.resultsCount}>
                  {isLoading
                    ? "Loading..."
                    : `Showing ${products.length} of ${total} products`}
                </span>
                
                {/* Custom Sort Dropdown */}
                <div className={styles.sortWrapper} ref={sortDropdownRef}>
                  <button
                    className={styles.sortButton}
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    aria-expanded={isSortDropdownOpen}
                  >
                    <span>{getSortLabel()}</span>
                    <FiChevronDown className={`${styles.sortChevron} ${isSortDropdownOpen ? styles.sortChevronOpen : ""}`} />
                  </button>
                  
                  {isSortDropdownOpen && (
                    <div className={styles.sortDropdown}>
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`${styles.sortOption} ${sortBy === option.value ? styles.sortOptionActive : ""}`}
                          onClick={() => handleSortSelect(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.productGrid}>
                {products.map((p) => {
                  const discount =
                    p.pricing?.salePrice && p.pricing?.originalPrice
                      ? Math.round(
                          ((p.pricing.originalPrice - p.pricing.salePrice) /
                            p.pricing.originalPrice) *
                            100,
                        )
                      : 0;
                  const inCart = isInCart(p._id);
                  const inWishlist = isInWishlist(p._id);
                  const addingToCart = cartLoadingId === p._id;
                  return (
                    <div className={styles.productCard} key={p._id}>
                      <Link
                        to={`/product/${p.productSlug}`}
                        className={styles.productMedia}
                      >
                        {discount > 0 && (
                          <span className={styles.badge}>{discount}% off</span>
                        )}
                        <span className={styles.productCatOverlay}>
                          {p.category?.categoryData?.label || "Gift"}
                        </span>
                        <div className={styles.wishlistActions}>
                          <button
                            type="button"
                            className={`${styles.wishlistBtn} ${
                              inWishlist ? styles.wishlistBtnActive : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(p._id);
                            }}
                            aria-label={
                              inWishlist
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                          >
                            {inWishlist ? <FaHeart /> : <FiHeart />}
                          </button>
                        </div>
                        {p.thumbnail?.url ? (
                          <img
                            src={p.thumbnail.url}
                            alt={p.productName}
                            className={styles.productImage}
                          />
                        ) : (
                          <span className={styles.placeholderLabel}>
                            Product Image
                          </span>
                        )}
                      </Link>
                      <div className={styles.productInfo}>
                        <Link
                          to={`/product/${p.productSlug}`}
                          className={styles.productName}
                        >
                          {p.productName}
                        </Link>
                        <div className={styles.productPrice}>
                          <span className={styles.priceNow}>
                            ₹
                            {(
                              p.pricing?.salePrice || p.pricing?.originalPrice
                            )?.toLocaleString() || "0"}
                          </span>
                          {p.pricing?.salePrice && p.pricing?.originalPrice && (
                            <span className={styles.priceOld}>
                              ₹{p.pricing.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className={`${styles.addToCartBtn} ${
                            inCart ? styles.addToCartBtnActive : ""
                          }`}
                          onClick={() => addToCart(p._id)}
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
                    </div>
                  );
                })}
              </div>

              {/* ---------- Pagination ---------- */}
              {totalPages > 1 && (
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        className={`${styles.pageBtn} ${
                          n === currentPage ? styles.activePage : ""
                        }`}
                        onClick={() => setCurrentPage(n)}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    className={styles.paginationBtn}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              )}
            </main>
          </div>

          {/* ================= TESTIMONIALS ================= */}
          <section className={styles.testimonials}>
            <div className={styles.testimonialsHeading}>
              <span className={styles.testimonialsKicker}>
                Love From Our Customers
              </span>
            </div>

            <div className={styles.testimonialsGrid}>
              {testimonials.map((t) => (
                <div className={styles.testimonialCard} key={t.name}>
                  <span className={styles.avatar}>{t.initials}</span>
                  <div className={styles.testimonialBody}>
                    <div className={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          className={
                            i < t.rating ? styles.starFilled : styles.starEmpty
                          }
                        />
                      ))}
                    </div>
                    <p className={styles.testimonialQuote}>"{t.quote}"</p>
                    <div className={styles.authorName}>– {t.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= COMMITMENT / BRAND STORY ================= */}
          <section className={styles.commitment}>
            <div className={styles.commitmentGrid}>
              <div className={styles.commitmentText}>
                <span className={styles.commitmentKicker}>
                  Jewels As Unique As You
                </span>
                <h2 className={styles.commitmentTitle}>
                  Commitment, Forever, In Every Sparkling Jewel
                </h2>
                <p className={styles.commitmentDesc}>
                  Every piece we craft is built on precision and care, from the
                  first cut to the final polish. We pair timeless design with
                  honest quality, so what you gift carries meaning that lasts
                  well beyond the moment it's opened.
                </p>

                <div className={styles.featureList}>
                  {jewelHighlights.map((pair, idx) => (
                    <React.Fragment key={idx}>
                      <div className={styles.featureItem}>
                        <span className={styles.featureIcon}>
                          <FiCheck />
                        </span>
                        {pair[0]}
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.featureIcon}>
                          <FiCheck />
                        </span>
                        {pair[1]}
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <a href="#shopSection" className={styles.knowMoreBtn}>
                  Shop
                </a>
              </div>

              <div className={styles.commitmentMedia}>
                <img
                  src={giftMiddle}
                  alt="Model wearing layered gold jewellery"
                  className={styles.commitmentImage}
                />
              </div>
            </div>
          </section>

          {/* ================= PERKS STRIP ================= */}
          <section className={styles.perks}>
            {perks.map((perk) => (
              <div className={styles.perk} key={perk.title}>
                <div className={styles.icon}>{perk.icon}</div>
                <div>
                  <h4>{perk.title}</h4>
                  <p>{perk.text}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* ---------------- Mobile Bottom Sheet Filter ---------------- */}
        {isMobileFilterOpen && (
          <div className={styles.filterOverlay} onClick={closeMobileFilter} />
        )}

        <div
          className={`${styles.mobileFilterSheet} ${
            isMobileFilterOpen ? styles.mobileFilterSheetActive : ""
          }`}
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

            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Recipient</span>
              {FILTER_RECIPIENTS.map((r) => (
                <label key={r} className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_recipient"
                    checked={selectedRecipient === r}
                    onChange={() => setSelectedRecipient(r)}
                  />
                  {r}
                </label>
              ))}
            </div>

            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Budget</span>
              {FILTER_BUDGETS.map((b) => (
                <label key={b} className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_budget"
                    checked={selectedBudget === b}
                    onChange={() => setSelectedBudget(b)}
                  />
                  {b}
                </label>
              ))}
            </div>

            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Promotions</span>
              {FILTER_PROMOTIONS.map((p) => (
                <label key={p} className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_promotion"
                    checked={selectedPromotion === p}
                    onChange={() => setSelectedPromotion(p)}
                  />
                  {p}
                </label>
              ))}
            </div>

            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Availability</span>
              {FILTER_AVAILABILITY.map((a) => (
                <label key={a} className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_availability"
                    checked={selectedAvailability === a}
                    onChange={() => setSelectedAvailability(a)}
                  />
                  {a}
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

        <Footer />
      </div>
    </>
  );
}