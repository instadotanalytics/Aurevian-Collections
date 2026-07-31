// src/Pages/Seller/SellerDashboard/components/ProductManagement.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCopy,
  FiDownload,
  FiUpload,
  FiPackage,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./ProductManagement.module.css";

import {
  fetchProducts,
  fetchCategories,
  deleteProduct,
  fetchProductLimitStatus,
} from "../../../../redux/slices/sellerProductSlice";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, isLoading, pagination, limitStatus } = useSelector(
    (state) => state.sellerProduct
  );

  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    search: "",
    page: 1,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProductLimitStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap();
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error(error || "Failed to delete product");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Draft: { color: "#64748b", bg: "rgba(100, 116, 139, 0.1)" },
      Pending: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
      Published: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
      Scheduled: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
      Archived: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
      Rejected: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
    };
    const style = statusMap[status] || statusMap.Draft;
    return (
      <span
        className={styles.statusBadge}
        style={{ color: style.color, background: style.bg }}
      >
        {status}
      </span>
    );
  };

  const getAvailabilityBadge = (availability) => {
    const map = {
      "In Stock": { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
      "Out of Stock": { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
      "Pre Order": { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    };
    const style = map[availability] || map["Out of Stock"];
    return (
      <span
        className={styles.statusBadge}
        style={{ color: style.color, background: style.bg }}
      >
        {availability}
      </span>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          {limitStatus && (
            <p className={styles.subtitle}>
              {limitStatus.isUnlimited ? (
                "Unlimited products available"
              ) : (
                `${limitStatus.used} of ${limitStatus.limit} products used (${limitStatus.remaining} remaining)`
              )}
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.bulkUploadBtn}
            onClick={() => setShowBulkUpload(true)}
          >
            <FiUpload size={18} />
            Bulk Upload
          </button>
          <button
            className={styles.addProductBtn}
            onClick={() => navigate("/seller/dashboard/products/new")}
          >
            <FiPlus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Archived">Archived</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <FiPackage className={styles.emptyIcon} />
          <h3>No products yet</h3>
          <p>Start adding your jewellery products to sell on Aurevian Collections.</p>
          <button
            className={styles.addProductBtn}
            onClick={() => navigate("/seller/dashboard/products/new")}
          >
            <FiPlus size={18} />
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <div key={product._id} className={styles.productCard}>
                <div className={styles.productImageWrapper}>
                  <img
                    src={product.thumbnail?.url || "/placeholder.jpg"}
                    alt={product.productName}
                    className={styles.productImage}
                  />
                  {product.labels?.featured && (
                    <span className={styles.featuredBadge}>Featured</span>
                  )}
                  {product.labels?.bestSeller && (
                    <span className={styles.bestSellerBadge}>Best Seller</span>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.productName}</h3>
                  <p className={styles.productBrand}>{product.brand}</p>
                  
                  <div className={styles.productMeta}>
                    <div className={styles.priceInfo}>
                      <span className={styles.originalPrice}>
                        ₹{product.pricing.originalPrice}
                      </span>
                      {product.pricing.salePrice && (
                        <span className={styles.salePrice}>
                          ₹{product.pricing.salePrice}
                        </span>
                      )}
                    </div>
                    <div className={styles.stockInfo}>
                      {getAvailabilityBadge(product.inventory.availability)}
                      <span className={styles.stockCount}>
                        {product.inventory.stockQuantity} units
                      </span>
                    </div>
                  </div>

                  <div className={styles.productFooter}>
                    <div className={styles.statusGroup}>
                      {getStatusBadge(product.status)}
                      <span className={styles.dateInfo}>
                        <FiClock size={14} />
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/product/${product.productSlug}`)}
                        title="View"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/seller/dashboard/products/edit/${product._id}`)}
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={styles.pageBtn}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete "{selectedProduct?.productName}"?
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal - To be implemented */}
      {showBulkUpload && (
        <div className={styles.modalOverlay} onClick={() => setShowBulkUpload(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Bulk Upload Products</h3>
            <p>Upload multiple products at once using CSV/JSON format.</p>
            <p className={styles.note}>Available for Silver, Gold, and Platinum plans only.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowBulkUpload(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;