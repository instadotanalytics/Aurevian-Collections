// src/Pages/Shop/Shop.jsx

import React, { useEffect, useState } from "react";
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

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [cartLoadingId, setCartLoadingId] = useState(null);

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
              {products.map((p) => {
                const inCart = isInCart(p._id);
                const inWishlist = isInWishlist(p._id);
                const addingToCart = cartLoadingId === p._id;
                return (
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
