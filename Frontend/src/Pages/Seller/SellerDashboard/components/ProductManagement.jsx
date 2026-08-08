// src/Pages/Seller/SellerDashboard/ProductManagement.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiPackage,
  FiDollarSign,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./ProductManagement.module.css";

import {
  fetchProducts,
  deleteProduct,
  fetchProductLimitStatus,
  fetchPlacementCounts,
} from "../../../../redux/slices/sellerProductSlice";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, isLoading, pagination, limitStatus, placementCounts } =
    useSelector((state) => state.sellerProduct);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProductData();
    dispatch(fetchPlacementCounts());
  }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  const fetchProductData = () => {
    const params = {
      page: currentPage,
      limit: 20,
      status: statusFilter || undefined,
      categoryId: categoryFilter || undefined,
      search: searchTerm || undefined,
    };
    dispatch(fetchProducts(params));
    dispatch(fetchProductLimitStatus());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProductData();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  const handleEdit = (product) => {
    navigate(`/seller/dashboard/products/edit/${product._id}`);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap();
      toast.success("Product archived successfully");
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProductData();
      dispatch(fetchPlacementCounts());
    } catch (error) {
      toast.error(error || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/product/${product.productSlug}`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Draft: { className: styles.statusDraft, label: "Draft" },
      Pending: { className: styles.statusPending, label: "Pending" },
      Published: { className: styles.statusPublished, label: "Published" },
      Scheduled: { className: styles.statusScheduled, label: "Scheduled" },
      Archived: { className: styles.statusArchived, label: "Archived" },
      Rejected: { className: styles.statusRejected, label: "Rejected" },
    };
    const statusInfo = statusMap[status] || statusMap.Draft;
    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const renderProductCard = (product) => {
    const displayPrice =
      product.pricing?.salePrice || product.pricing?.originalPrice;
    const hasDiscount =
      product.pricing?.salePrice &&
      product.pricing?.salePrice < product.pricing?.originalPrice;

    return (
      <div key={product._id} className={styles.productCard}>
        <div className={styles.productImage}>
          <img
            src={product.thumbnail?.url || "/placeholder-image.jpg"}
            alt={product.productName}
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
          {product.labels?.featured && (
            <span className={styles.featuredBadge}>⭐ Featured</span>
          )}
          {product.labels?.bestSeller && (
            <span className={styles.bestSellerBadge}>🏆 Best Seller</span>
          )}
        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.productName}</h3>
          <p className={styles.productBrand}>{product.brand}</p>
          <div className={styles.productMeta}>
            <span className={styles.productPrice}>
              ₹{displayPrice?.toLocaleString() || "0"}
              {hasDiscount && (
                <span className={styles.originalPrice}>
                  ₹{product.pricing.originalPrice?.toLocaleString()}
                </span>
              )}
            </span>
            {hasDiscount && (
              <span className={styles.discountBadge}>
                {Math.round(
                  ((product.pricing.originalPrice - product.pricing.salePrice) /
                    product.pricing.originalPrice) *
                    100,
                )}
                % OFF
              </span>
            )}
          </div>
          <div className={styles.productStock}>
            <span className={styles.stockLabel}>Stock:</span>
            <span
              className={
                product.inventory?.stockQuantity > 0
                  ? styles.inStock
                  : styles.outOfStock
              }
            >
              {product.inventory?.stockQuantity > 0
                ? `${product.inventory.stockQuantity} units`
                : "Out of Stock"}
            </span>
          </div>
          <div className={styles.productStatus}>
            {getStatusBadge(product.status)}
          </div>
          {product.placements && product.placements.length > 0 && (
            <div className={styles.productStock}>
              <span className={styles.stockLabel}>Visible on:</span>
              <span className={styles.inStock}>
                {product.placements.join(", ")}
              </span>
            </div>
          )}
        </div>

        <div className={styles.productActions}>
          <button
            className={styles.actionBtn}
            onClick={() => handleViewProduct(product)}
            title="View Product"
          >
            <FiEye size={16} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => handleEdit(product)}
            title="Edit Product"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => handleDeleteClick(product)}
            title="Archive Product"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className={styles.emptyState}>
        <FiPackage size={60} />
        <h3>No products found</h3>
        <p>
          {searchTerm || statusFilter || categoryFilter
            ? "Try adjusting your filters or search terms"
            : "Start selling by adding your first product"}
        </p>
        {!searchTerm && !statusFilter && !categoryFilter && (
          <button
            className={styles.addFirstProductBtn}
            onClick={() => navigate("/seller/dashboard/products/new")}
          >
            <FiPlus size={18} />
            Add Your First Product
          </button>
        )}
        {(searchTerm || statusFilter || categoryFilter) && (
          <button
            className={styles.clearFiltersBtn}
            onClick={handleClearFilters}
          >
            <FiX size={18} />
            Clear All Filters
          </button>
        )}
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;
    return (
      <div
        className={styles.modalOverlay}
        onClick={() => setShowDeleteModal(false)}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h3>Archive Product</h3>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setShowDeleteModal(false)}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <p>
              Are you sure you want to archive "{selectedProduct?.productName}"?
            </p>
            <p className={styles.modalWarning}>
              This product will be hidden from your store but you can restore it
              later.
            </p>
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.modalCancelBtn}
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className={styles.modalConfirmBtn}
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Archiving..." : "Archive Product"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Products</h1>
          <span className={styles.productCount}>
            {pagination.total || 0} products
          </span>
        </div>
        <div className={styles.headerRight}>
          {placementCounts && (
            <div className={styles.placementCounts}>
              <span className={styles.placementLabel}>
                <FiGrid size={14} />
                Placements:
              </span>
              <span className={styles.placementItem}>
                Shop: <strong>{placementCounts.shop || 0}</strong>
              </span>
              <span className={styles.placementItem}>
                Collections: <strong>{placementCounts.collections || 0}</strong>
              </span>
              <span className={styles.placementItem}>
                Gifts: <strong>{placementCounts.gifts || 0}</strong>
              </span>
              <span className={styles.placementItem}>
                Offers: <strong>{placementCounts.offers || 0}</strong>
              </span>
            </div>
          )}

          {limitStatus && (
            <div className={styles.limitStatus}>
              <span className={styles.limitLabel}>
                {limitStatus.isUnlimited
                  ? "♾️ Unlimited"
                  : `${limitStatus.remaining} slots remaining`}
              </span>
            </div>
          )}

          <button
            className={styles.addBtn}
            onClick={() => navigate("/seller/dashboard/products/new")}
          >
            <FiPlus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            <FiSearch size={18} />
          </button>
        </form>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
          </select>

          {(searchTerm || statusFilter || categoryFilter) && (
            <button
              className={styles.clearFiltersBtn}
              onClick={handleClearFilters}
            >
              <FiX size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.productsGrid}>
          {products.map(renderProductCard)}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft size={18} />
          </button>

          <div className={styles.paginationPages}>
            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              const isActive = page === currentPage;
              const isNearCurrent = Math.abs(page - currentPage) <= 2;
              const isFirst = page === 1;
              const isLast = page === pagination.totalPages;

              if (isNearCurrent || isFirst || isLast) {
                return (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${isActive ? styles.activePage : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              }

              if (
                (page === currentPage - 3 && currentPage > 4) ||
                (page === currentPage + 3 &&
                  currentPage < pagination.totalPages - 3)
              ) {
                return (
                  <span key={page} className={styles.pageDots}>
                    ...
                  </span>
                );
              }

              return null;
            })}
          </div>

          <button
            className={styles.paginationBtn}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {renderDeleteModal()}
    </div>
  );
};

export default ProductManagement;
