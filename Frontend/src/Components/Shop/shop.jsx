// src/Pages/Shop/Shop.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./shop.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";
import shopHero from "../../assets/shophero.png";

import { LuSlidersHorizontal } from "react-icons/lu";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { FiShoppingBag, FiCheck, FiChevronDown } from "react-icons/fi";

import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

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

export default function Shop() {
  const dispatch = useDispatch();
  const { byPlacement, isLoading } = useSelector(
    (state) => state.storefrontProduct,
  );
  const shopData = byPlacement.shop || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [cart, setCart] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  // Fetch categories from API
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

  // Fetch products when filters change
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

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addToCart = (id) => {
    setCart((prev) => new Set(prev).add(id));
  };

  const products = shopData.products || [];
  const { total, totalPages } = shopData.pagination || {
    total: 0,
    totalPages: 1,
  };

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
          {/* Filter Toggle Button (Mobile) */}
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setFiltersOpen((prev) => !prev)}
            aria-expanded={filtersOpen}
          >
            <span className={styles.filterToggleText}>Filter Options</span>
            <span className={styles.filterToggleIcon}>
              <LuSlidersHorizontal />
            </span>
          </button>

          {/* Filter Overlay */}
          {filtersOpen && (
            <div
              className={styles.filterOverlay}
              onClick={() => setFiltersOpen(false)}
            />
          )}

          {/* Filters Sidebar */}
          <aside
            className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}
          >
            <div className={styles.filtersSheetHeader}>
              <h3 className={styles.filtersHeading}>Filter Options</h3>
              <button
                type="button"
                className={styles.filtersClose}
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            <div className={styles.filtersInner}>
              {/* Category Filter */}
              <div className={styles.filterGroup}>
                <h3 className={styles.groupHeading}>By Category</h3>
                <ul>
                  <li
                    className={selectedCategoryId === "" ? styles.selected : ""}
                  >
                    <label className={styles.checkRow}>
                      <input
                        type="radio"
                        checked={selectedCategoryId === ""}
                        onChange={() => {
                          setSelectedCategoryId("");
                          setPage(1);
                        }}
                      />
                      <span className={styles.checkLabel}>All</span>
                    </label>
                  </li>
                  {categories.map((c) => (
                    <li
                      key={c.id}
                      className={
                        selectedCategoryId === c.id ? styles.selected : ""
                      }
                    >
                      <label className={styles.checkRow}>
                        <input
                          type="radio"
                          checked={selectedCategoryId === c.id}
                          onChange={() => {
                            setSelectedCategoryId(c.id);
                            setPage(1);
                          }}
                        />
                        <span className={styles.checkLabel}>{c.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Apply Filters Button (Mobile) */}
              <button
                type="button"
                className={styles.applyFilters}
                onClick={() => setFiltersOpen(false)}
              >
                Apply Filters
              </button>
            </div>
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
              <div className={styles.sortWrapper}>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Default Sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <FiChevronDown className={styles.sortChevron} />
              </div>
            </div>

            {/* Products */}
            <div className={styles.productGrid}>
              {products.map((p) => (
                <div className={styles.productCard} key={p._id}>
                  <Link
                    to={`/product/${p.productSlug}`}
                    className={styles.productMedia}
                  >
                    {p.pricing?.salePrice && p.pricing?.originalPrice && (
                      <span className={styles.badge}>
                        {Math.round(
                          ((p.pricing.originalPrice - p.pricing.salePrice) /
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
                        className={`${styles.wishlistBtn} ${wishlist.has(p._id) ? styles.wishlistBtnActive : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(p._id);
                        }}
                        aria-label={
                          wishlist.has(p._id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {wishlist.has(p._id) ? <FaHeart /> : <FiHeart />}
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
                      className={`${styles.addToCartBtn} ${cart.has(p._id) ? styles.addToCartBtnActive : ""}`}
                      onClick={() => addToCart(p._id)}
                      disabled={cart.has(p._id)}
                    >
                      {cart.has(p._id) ? (
                        <>
                          <FiCheck /> Added to Cart
                        </>
                      ) : (
                        <>
                          <FiShoppingBag /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
      </div>
      <Footer />
    </div>
  );
}