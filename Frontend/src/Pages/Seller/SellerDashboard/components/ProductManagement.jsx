// src/Pages/Seller/SellerDashboard/ProductManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiEye,
  FiPackage,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./ProductManagement.module.css";

import {
  fetchProducts,
  deleteProduct,
  fetchProductLimitStatus,
  fetchPlacementCounts,
} from "../../../../redux/slices/sellerProductSlice";

// Debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Skeleton Loader Component
const SkeletonLoader = ({ count = 10 }) => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonRow}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLineShort}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLineShort}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

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
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedRows, setSelectedRows] = useState({});
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedStatusFilter = useDebounce(statusFilter, 300);
  const debouncedCategoryFilter = useDebounce(categoryFilter, 300);

  const visibleProducts = products.slice(0, visibleCount);

  useEffect(() => {
    dispatch(fetchPlacementCounts());
    dispatch(fetchProductLimitStatus());
  }, []);

  useEffect(() => {
    setVisibleCount(10);
    setAllProductsLoaded(false);
    setShowSkeleton(true);
    setIsThrottled(true);

    const timer = setTimeout(() => {
      setIsThrottled(false);
      fetchProductData();
      setShowSkeleton(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentPage, debouncedStatusFilter, debouncedCategoryFilter, debouncedSearchTerm]);

  const fetchProductData = () => {
    const params = {
      page: currentPage,
      limit: 20,
      status: debouncedStatusFilter || undefined,
      categoryId: debouncedCategoryFilter || undefined,
      search: debouncedSearchTerm || undefined,
    };
    dispatch(fetchProducts(params));
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
    setTimeout(() => {
      fetchProductData();
    }, 100);
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
      setVisibleCount(10);
      setAllProductsLoaded(false);
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/product/${product.productSlug}`);
  };

  const toggleRowExpand = (productId) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const toggleRowSelect = (productId) => {
    setSelectedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const toggleAllSelect = () => {
    const allSelected = products.every(p => selectedRows[p._id]);
    const newState = {};
    products.forEach(p => {
      newState[p._id] = !allSelected;
    });
    setSelectedRows(newState);
  };

  const handleCardClick = (product) => {
    toggleRowExpand(product._id);
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

  const getSerialNumber = (index) => {
    return (currentPage - 1) * 20 + index + 1;
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
    if (selectedIds.length === 0) {
      toast.error("Please select products to delete");
      return;
    }
    toast.success(`${selectedIds.length} products selected for deletion`);
  };

  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || allProductsLoaded || visibleCount >= products.length) {
      if (visibleCount >= products.length) {
        setAllProductsLoaded(true);
      }
      return;
    }

    setIsLoadingMore(true);
    let currentCount = visibleCount;
    const maxCount = Math.min(visibleCount + 10, products.length);
    
    const loadNextBatch = () => {
      if (currentCount < maxCount) {
        currentCount++;
        setVisibleCount(currentCount);
        setTimeout(loadNextBatch, 200);
      } else {
        setIsLoadingMore(false);
        if (currentCount >= products.length) {
          setAllProductsLoaded(true);
        }
      }
    };
    
    setTimeout(loadNextBatch, 200);
  }, [visibleCount, products.length, isLoadingMore, allProductsLoaded]);

  useEffect(() => {
    if (visibleProducts.length === 0 || allProductsLoaded || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('products-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [visibleProducts, allProductsLoaded, loadMoreProducts, isLoading]);

  const selectedCount = Object.keys(selectedRows).filter(id => selectedRows[id]).length;
  const showLoadingState = isLoading || isThrottled || showSkeleton;

  const renderTableRow = (product, index) => {
    const isExpanded = expandedRows[product._id];
    const isSelected = selectedRows[product._id];
    const displayPrice = product.pricing?.salePrice || product.pricing?.originalPrice;
    const hasDiscount = product.pricing?.salePrice && product.pricing?.salePrice < product.pricing?.originalPrice;
    const serialNumber = getSerialNumber(index);

    return (
      <React.Fragment key={product._id}>
        <tr 
          className={`${styles.tableRow} ${isExpanded ? styles.expanded : ""}`}
          onClick={() => handleCardClick(product)}
        >
          {/* Index */}
          <td className={styles.indexCell} onClick={(e) => e.stopPropagation()}>
            <span className={styles.indexNumber}>{serialNumber}</span>
          </td>
          
          {/* Checkbox */}
          <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={() => toggleRowSelect(product._id)}
              className={styles.checkbox}
            />
          </td>
          
          {/* Image */}
          <td className={styles.imageCell} onClick={(e) => e.stopPropagation()}>
            <img
              src={product.thumbnail?.url || "/placeholder-image.jpg"}
              alt={product.productName}
              className={styles.thumbnail}
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          </td>
          
          {/* Product Name & SKU */}
          <td className={styles.nameCell}>
            <div className={styles.productNameCompact} title={product.productName}>
              {product.productName}
            </div>
            <div className={styles.productSku}>SKU: {product.sku || 'N/A'}</div>
          </td>
          
          {/* Category */}
          <td className={styles.categoryCell}>
            {product.category?.categoryData?.label || 'Uncategorized'}
          </td>
          
          {/* Price */}
          <td className={styles.priceCell}>
            <div className={styles.priceCompact}>
              <div className={styles.priceRow}>
                ₹{displayPrice?.toLocaleString() || "0"}
                {hasDiscount && (
                  <span className={styles.originalPriceCompact}>
                    ₹{product.pricing.originalPrice?.toLocaleString()}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className={styles.discountCompact}>
                  {Math.round(
                    ((product.pricing.originalPrice - product.pricing.salePrice) /
                      product.pricing.originalPrice) * 100
                  )}% OFF
                </span>
              )}
            </div>
          </td>
          
          {/* Stock */}
          <td className={styles.stockCell}>
            <span className={product.inventory?.stockQuantity > 0 ? styles.inStock : styles.outOfStock}>
              {product.inventory?.stockQuantity > 0 ? product.inventory.stockQuantity : '0'}
            </span>
          </td>
          
          {/* Status */}
          <td className={styles.statusCell}>
            {getStatusBadge(product.status)}
          </td>
          
          {/* Placements */}
          <td className={styles.placementsCell}>
            {product.placements && product.placements.length > 0 ? (
              <span className={styles.placementTags}>
                {product.placements.slice(0, 2).join(', ')}
                {product.placements.length > 2 && ` +${product.placements.length - 2}`}
              </span>
            ) : (
              <span className={styles.noPlacements}>—</span>
            )}
          </td>
          
          {/* Actions */}
          <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.actionIconBtn}
              onClick={() => handleViewProduct(product)}
              title="View Product"
            >
              <FiEye size={16} />
            </button>
            <button
              className={styles.actionIconBtn}
              onClick={() => handleEdit(product)}
              title="Edit Product"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              className={styles.actionIconBtn}
              onClick={() => toggleRowExpand(product._id)}
              title="Expand Details"
            >
              {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>
          </td>
        </tr>
        
        {/* Expanded Row */}
        {isExpanded && (
          <tr className={styles.expandedRow}>
            <td colSpan="10">
              <div className={styles.expandedContent}>
                <div className={styles.expandedGrid}>
                  <div className={styles.expandedSection}>
                    <h4>Product Details</h4>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Description:</span>
                      <span className={styles.expandedValue}>{product.description || 'No description'}</span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Brand:</span>
                      <span className={styles.expandedValue}>{product.brand || 'N/A'}</span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Weight:</span>
                      <span className={styles.expandedValue}>{product.weight || 'N/A'}</span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Material:</span>
                      <span className={styles.expandedValue}>{product.material || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.expandedSection}>
                    <h4>Pricing & Inventory</h4>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Sale Price:</span>
                      <span className={styles.expandedValue}>₹{product.pricing?.salePrice?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Original Price:</span>
                      <span className={styles.expandedValue}>₹{product.pricing?.originalPrice?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Stock:</span>
                      <span className={styles.expandedValue}>{product.inventory?.stockQuantity || 0} units</span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Low Stock Alert:</span>
                      <span className={styles.expandedValue}>{product.inventory?.lowStockThreshold || 'Not set'}</span>
                    </div>
                  </div>
                  <div className={styles.expandedSection}>
                    <h4>Placements & Labels</h4>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Placements:</span>
                      <span className={styles.expandedValue}>
                        {product.placements && product.placements.length > 0 
                          ? product.placements.join(', ') 
                          : 'None'}
                      </span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Labels:</span>
                      <span className={styles.expandedValue}>
                        {product.labels && Object.keys(product.labels).filter(k => product.labels[k]).length > 0
                          ? Object.keys(product.labels).filter(k => product.labels[k]).join(', ')
                          : 'None'}
                      </span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Created:</span>
                      <span className={styles.expandedValue}>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.expandedItem}>
                      <span className={styles.expandedLabel}>Last Updated:</span>
                      <span className={styles.expandedValue}>
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className={styles.emptyState}>
        <FiPackage size={60} className={styles.emptyIcon} />
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
      {/* Header */}
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

      {/* Filters */}
      <div className={styles.filters}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            Search
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

      {/* Table */}
      {showLoadingState && products.length === 0 ? (
        <div className={styles.tableContainer}>
          <SkeletonLoader count={10} />
        </div>
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableToolbar}>
            <span className={styles.selectedInfo}>
              {selectedCount > 0 ? `${selectedCount} product${selectedCount > 1 ? 's' : ''} selected` : ''}
            </span>
            {selectedCount > 0 && (
              <button className={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
                <FiTrash2 size={14} />
                Delete Selected
              </button>
            )}
          </div>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th className={styles.indexCell}>#</th>
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    onChange={toggleAllSelect}
                    checked={products.length > 0 && products.every(p => selectedRows[p._id])}
                  />
                </th>
                <th className={styles.imageCell}>Image</th>
                <th className={styles.nameCell}>Product</th>
                <th className={styles.categoryCell}>Category</th>
                <th className={styles.priceCell}>Price</th>
                <th className={styles.stockCell}>Stock</th>
                <th className={styles.statusCell}>Status</th>
                <th className={styles.placementsCell}>Placements</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product, index) => renderTableRow(product, index))}
            </tbody>
          </table>
          {!allProductsLoaded && products.length > visibleCount && (
            <div id="products-sentinel" className={styles.sentinel} />
          )}
          {isLoadingMore && (
            <div className={styles.loadingMore}>
              <div className={styles.spinnerSmall}></div>
              <span>Loading more products...</span>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!showLoadingState && pagination.totalPages > 1 && (
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