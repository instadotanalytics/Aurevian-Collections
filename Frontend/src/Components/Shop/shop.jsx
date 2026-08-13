// src/Pages/Shop/Shop.jsx

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./shop.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";
import shopHero from "../../assets/shophero.png";

import { LuSlidersHorizontal } from "react-icons/lu";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { FiShoppingBag, FiCheck, FiChevronDown } from "react-icons/fi";

import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const SORT_OPTIONS = [
  { value: "", label: "Default Sorting" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const perks = [
  {
    icon: "📦",
    title: "Free Shipping",
    text: "Free delivery for orders above ₹2,000",
  },
  {
    icon: "💳",
    title: "Flexible Payment",
    text: "Multiple secure payment options",
  },
  { icon: "☎", title: "24×7 Support", text: "We support online all day" },
];

/* Truncate names > 3 words. Full name still passed to cart & shown on hover. */
const truncateName = (name) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length > 3) {
    return words.slice(0, 3).join(" ") + "...";
  }
  return name;
};

export default function Shop() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { byPlacement, isLoading } = useSelector(
    (state) => state.storefrontProduct,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const shopData = byPlacement.shop || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [cartLoadingId, setCartLoadingId] = useState(null);

  // Mobile filter sheet state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Mobile sort dropdown state
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Skeleton / throttling state
  const [displaySkeleton, setDisplaySkeleton] = useState(false);
  const loadStartRef = useRef(0);

  useEffect(() => {
    axios
      .get(`${API_URL}/seller/products/categories`)
      .then((res) => {
        const data = res.data.data || [];
        setCategories(data);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    dispatch(
      fetchProductsByPlacement({
        placement: "shop",
        page,
        limit: 12,
        categoryId: selectedCategoryId || undefined,
        sort: sort || undefined,
      }),
    );
  }, [dispatch, page, selectedCategoryId, sort]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  /* Throttle skeleton so it shows for at least 1000 ms (prevents flicker) */
  useEffect(() => {
    if (isLoading) {
      setDisplaySkeleton(true);
      loadStartRef.current = Date.now();
    } else {
      const elapsed = Date.now() - loadStartRef.current;
      const remaining = Math.max(0, 1000 - elapsed);
      const timer = setTimeout(() => {
        setDisplaySkeleton(false);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  /* Close mobile sort dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/shop" } });
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

  const clearAllFilters = () => {
    setSelectedCategoryId("");
    setPriceRange([0, 7000]);
    setSort("");
    setPage(1);
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
    setSort(value);
    setIsSortDropdownOpen(false);
    setPage(1);
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sort);
    return option ? option.label : "Default Sorting";
  };

  const products = shopData.products || [];
  const { total, totalPages } = shopData.pagination || {
    total: 0,
    totalPages: 1,
  };

  const skeletonItems = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.mainContent}>
        {/* Hero Section */}
        <section className={styles.pageTitle}>
          <img
            src={shopHero}
            alt="Shop Collection"
            className={styles.heroImage}
          />
        </section>

        {/* Shop Content */}
        <div className={styles.shopWrap}>
          {/* Mobile Filter Toggle Button */}
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

          {/* Desktop Filter Sidebar */}
          <aside className={styles.filterSidebar}>
            <h3 className={styles.filterTitle}>Filter</h3>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Category</span>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategoryId === ""}
                  onChange={() => {
                    setSelectedCategoryId("");
                    setPage(1);
                  }}
                />
                All
              </label>
              {categories.map((c) => (
                <label key={c.id} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategoryId === c.id}
                    onChange={() => {
                      setSelectedCategoryId(c.id);
                      setPage(1);
                    }}
                  />
                  {c.label}
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

            <button className={styles.filterClearBtn} onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </aside>

          {/* Product Grid */}
          <main>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <span className={styles.resultsCount}>
                {isLoading
                  ? "Loading..."
                  : `Showing ${products.length} of ${total} results`}
              </span>
              {/* <div className={styles.sortWrapper}>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className={styles.sortChevron} />
              </div> */}
            </div>

            {/* Skeleton Loading */}
            {displaySkeleton && (
              <div className={styles.skeletonGrid}>
                {skeletonItems.map((i) => (
                  <div className={styles.skeletonCard} key={i}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonText} />
                    <div
                      className={`${styles.skeletonText} ${styles.skeletonTextShort}`}
                    />
                    <div className={styles.skeletonBtn} />
                  </div>
                ))}
              </div>
            )}

            {/* Products */}
            {!displaySkeleton && (
              <div className={styles.productGrid}>
                {products.map((p) => {
                  const inCart = isInCart(p._id);
                  const inWishlist = isInWishlist(p._id);
                  const addingToCart = cartLoadingId === p._id;
                  const displayName = truncateName(p.productName);
                  return (
                    <div className={styles.productCard} key={p._id}>
                      <Link
                        to={`/product/${p.productSlug}`}
                        className={styles.productMedia}
                      >
                        {p.pricing?.salePrice && p.pricing?.originalPrice && (
                          <span className={styles.badge}>
                            {Math.round(
                              ((p.pricing.originalPrice -
                                p.pricing.salePrice) /
                                p.pricing.originalPrice) *
                                100,
                            )}
                            % off
                          </span>
                        )}
                        <span className={styles.productCatOverlay}>
                          {p.category?.categoryData?.label || "Uncategorized"}
                        </span>
                        <div className={styles.wishlistActions}>
                          <button
                            type="button"
                            className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleWishlist(p._id);
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
                        <img
                          src={p.thumbnail?.url || "/placeholder-image.jpg"}
                          alt={p.productName}
                          className={styles.productImage}
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                      </Link>
                      <div className={styles.productInfo}>
                        <Link
                          to={`/product/${p.productSlug}`}
                          className={styles.productName}
                          title={p.productName}
                        >
                          {displayName}
                        </Link>
                        <div className={styles.productPrice}>
                          <span className={styles.priceNow}>
                            ₹
                            {(
                              p.pricing?.salePrice || p.pricing?.originalPrice
                            )?.toLocaleString() || "0"}
                          </span>
                          {p.pricing?.salePrice &&
                            p.pricing?.originalPrice && (
                              <span className={styles.priceOld}>
                                ₹{p.pricing.originalPrice.toLocaleString()}
                              </span>
                            )}
                        </div>
                        <button
                          type="button"
                          className={`${styles.addToCartBtn} ${inCart ? styles.addToCartBtnActive : ""}`}
                          onClick={() => handleAddToCart(p._id)}
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
            )}

            {/* Pagination */}
            {!displaySkeleton && totalPages > 1 && (
              <div className={styles.pagination}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                >
                  ‹
                </a>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <a
                      key={n}
                      href="#"
                      className={n === page ? styles.active : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(n);
                      }}
                    >
                      {n}
                    </a>
                  ),
                )}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                >
                  ›
                </a>
              </div>
            )}
          </main>
        </div>

        {/* Perks Section */}
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

        {/* Mobile Bottom Sheet Filter */}
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
            {/* Sort By */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Sort By</span>
              <div className={styles.mobileSortWrapper} ref={sortDropdownRef}>
                <button
                  className={styles.mobileSortButton}
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  aria-expanded={isSortDropdownOpen}
                >
                  <span>{getSortLabel()}</span>
                  <FiChevronDown
                    className={`${styles.mobileSortChevron} ${isSortDropdownOpen ? styles.mobileSortChevronOpen : ""}`}
                  />
                </button>

                {isSortDropdownOpen && (
                  <div className={styles.mobileSortDropdown}>
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`${styles.mobileSortOption} ${sort === option.value ? styles.mobileSortOptionActive : ""}`}
                        onClick={() => handleSortSelect(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Category</span>
              <div className={styles.mobileFilterGrid}>
                <label className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_category"
                    checked={selectedCategoryId === ""}
                    onChange={() => {
                      setSelectedCategoryId("");
                      setPage(1);
                    }}
                  />
                  All
                </label>
                {categories.map((c) => (
                  <label key={c.id} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_category"
                      checked={selectedCategoryId === c.id}
                      onChange={() => {
                        setSelectedCategoryId(c.id);
                        setPage(1);
                      }}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range (Bottom) */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>
                Price Range
              </span>
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

            <button className={styles.filterClearBtn} onClick={clearAllFilters}>
              Clear All Filters
            </button>

            <button
              className={styles.mobileFilterApply}
              onClick={closeMobileFilter}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}