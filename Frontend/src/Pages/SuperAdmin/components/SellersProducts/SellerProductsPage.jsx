// src/Pages/SuperAdmin/SuperAdminDashboard/components/SellersProducts/SellerProductsPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiEye,
  FiLoader,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiMail,
  FiShoppingBag,
  FiBox,
  FiCheckCircle,
  FiArchive,
} from "react-icons/fi";
import ProductDetailsModal from "./ProductDetailsModal.jsx";
import styles from "./SellerProductsPage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PRODUCT_STATUSES = [
  "Draft",
  "Pending",
  "Published",
  "Scheduled",
  "Archived",
  "Rejected",
];

const STOCK_FILTERS = [
  { value: "all", label: "All Stock" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "pre_order", label: "Pre Order" },
];

const SellerProductsPage = ({ sellerId, onBack }) => {
  const token = localStorage.getItem("superAdminToken");

  const [seller, setSeller] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [selectedProductId, setSelectedProductId] = useState(null);

  // --- Fetch seller + aggregated product stats (header) ---
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const response = await axios.get(
        `${API_URL}/super-admin/sellers/${sellerId}/product-stats`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        setSeller(response.data.data.seller);
        setProductStats(response.data.data.productStats);
      }
    } catch (err) {
      setStatsError(
        err.response?.data?.message || "Unable to load seller details.",
      );
    } finally {
      setStatsLoading(false);
    }
  };

  // --- Fetch paginated / filtered product list ---
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      const response = await axios.get(
        `${API_URL}/super-admin/sellers/${sellerId}/products`,
        {
          params: {
            page,
            limit: 12,
            search,
            status: statusFilter,
            categoryId: categoryFilter === "all" ? undefined : categoryFilter,
            stockStatus: stockFilter,
          },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.pages);
        setTotalProducts(response.data.data.pagination.total);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to load products for this seller.";
      setProductsError(message);
      toast.error(message);
    } finally {
      setProductsLoading(false);
    }
  };

  // --- Fetch categories for the filter dropdown (public endpoint) ---
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/seller/products/categories`);
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      // Non-critical — filter simply won't have options if this fails.
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, page, statusFilter, stockFilter, categoryFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, stockFilter, categoryFilter]);

  const getStatusBadge = (status) => {
    const map = {
      Draft: styles.badgeDraft,
      Pending: styles.badgePending,
      Published: styles.badgePublished,
      Scheduled: styles.badgeScheduled,
      Archived: styles.badgeArchived,
      Rejected: styles.badgeRejected,
    };
    return map[status] || styles.badgeDraft;
  };

  if (statsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FiLoader className={styles.spinner} />
        <p>Loading seller...</p>
      </div>
    );
  }

  if (statsError || !seller) {
    return (
      <div className={styles.errorContainer}>
        <FiAlertCircle className={styles.errorIcon} />
        <p>{statsError || "Seller not found."}</p>
        <button className={styles.backBtn} onClick={onBack}>
          <FiArrowLeft /> Back to Sellers &amp; Products
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeaderRow}>
        <button className={styles.backBtn} onClick={onBack}>
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className={styles.sellerHeader}>
        <div className={styles.sellerHeaderLeft}>
          <h2 className={styles.sellerHeaderName}>{seller.fullName}</h2>
          <div className={styles.sellerHeaderMeta}>
            <span>
              <FiMail size={13} /> {seller.email}
            </span>
            {seller.storeInfo?.storeName && (
              <span>
                <FiShoppingBag size={13} /> {seller.storeInfo.storeName}
              </span>
            )}
          </div>
        </div>
        <div className={styles.sellerHeaderStats}>
          <div className={styles.headerStatCard}>
            <FiBox size={18} />
            <div>
              <span className={styles.headerStatValue}>
                {productStats?.total ?? 0}
              </span>
              <span className={styles.headerStatLabel}>Total Products</span>
            </div>
          </div>
          <div className={styles.headerStatCard}>
            <FiCheckCircle size={18} />
            <div>
              <span className={styles.headerStatValue}>
                {productStats?.published ?? 0}
              </span>
              <span className={styles.headerStatLabel}>Published</span>
            </div>
          </div>
          <div className={styles.headerStatCard}>
            <FiPackage size={18} />
            <div>
              <span className={styles.headerStatValue}>
                {productStats?.outOfStock ?? 0}
              </span>
              <span className={styles.headerStatLabel}>Out of Stock</span>
            </div>
          </div>
          <div className={styles.headerStatCard}>
            <FiArchive size={18} />
            <div>
              <span className={styles.headerStatValue}>
                {productStats?.archived ?? 0}
              </span>
              <span className={styles.headerStatLabel}>Archived</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterBox}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterBox}>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className={styles.filterSelect}
          >
            {STOCK_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {categories.length > 0 && (
          <div className={styles.filterBox}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                  {cat.label || cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Products */}
      {productsLoading && products.length === 0 ? (
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.spinner} />
          <p>Loading products...</p>
        </div>
      ) : productsError && products.length === 0 ? (
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <p>{productsError}</p>
          <button className={styles.backBtn} onClick={fetchProducts}>
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <FiPackage size={40} />
          <p>No products found for this seller.</p>
        </div>
      ) : (
        <>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <div key={product._id} className={styles.productCard}>
                <div className={styles.productImageWrap}>
                  {product.thumbnail?.url ? (
                    <img
                      src={product.thumbnail.url}
                      alt={product.thumbnail?.altText || product.productName}
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <FiPackage size={28} />
                    </div>
                  )}
                  <span
                    className={`${styles.statusChip} ${getStatusBadge(product.status)}`}
                  >
                    {product.status}
                  </span>
                </div>

                <div className={styles.productBody}>
                  <h4 className={styles.productName}>{product.productName}</h4>
                  <p className={styles.productMeta}>
                    {product.category?.categoryData?.label || "Uncategorized"}
                    {product.category?.subCategoryData?.label
                      ? ` · ${product.category.subCategoryData.label}`
                      : ""}
                  </p>
                  {product.sku && (
                    <p className={styles.productSku}>SKU: {product.sku}</p>
                  )}

                  <div className={styles.priceRow}>
                    {product.pricing?.salePrice ? (
                      <>
                        <span className={styles.salePrice}>
                          ₹{product.pricing.salePrice}
                        </span>
                        <span className={styles.originalPriceStrike}>
                          ₹{product.pricing.originalPrice}
                        </span>
                      </>
                    ) : (
                      <span className={styles.salePrice}>
                        ₹{product.pricing?.originalPrice ?? 0}
                      </span>
                    )}
                  </div>

                  <div className={styles.stockRow}>
                    <span
                      className={
                        product.inventory?.availability === "Out of Stock"
                          ? styles.stockOut
                          : styles.stockIn
                      }
                    >
                      {product.inventory?.availability || "Unknown"}
                    </span>
                    <span className={styles.stockQty}>
                      Qty: {product.inventory?.stockQuantity ?? 0}
                    </span>
                  </div>

                  <button
                    className={styles.viewProductBtn}
                    onClick={() => setSelectedProductId(product._id)}
                  >
                    <FiEye size={14} /> View Product
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.pageBtn} ${page === 1 ? styles.disabled : ""}`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronLeft size={16} /> Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages} · {totalProducts} products
              </span>
              <button
                className={`${styles.pageBtn} ${page === totalPages ? styles.disabled : ""}`}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {selectedProductId && (
        <ProductDetailsModal
          sellerId={sellerId}
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
};

export default SellerProductsPage;
