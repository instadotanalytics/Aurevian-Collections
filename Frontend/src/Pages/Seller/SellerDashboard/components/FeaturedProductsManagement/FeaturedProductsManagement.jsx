// src/Pages/Seller/SellerDashboard/components/FeaturedProductsManagement/FeaturedProductsManagement.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchFeaturedProductsSeller,
  fetchAvailableProductsSeller,
  addFeaturedProductSeller,
  removeFeaturedProductSeller,
  toggleFeaturedProductStatusSeller,
  reorderFeaturedProductsSeller,
  clearSellerAvailableProducts,
  clearSellerFeaturedProductsError,
} from "../../../../../redux/slices/featuredProductSlice";
import styles from "./FeaturedProductsManagement.module.css";

const EMPTY_SECTION_STATE = {
  entries: [],
  isLoading: false,
  isSaving: false,
  error: null,
  availableProducts: [],
  isSearching: false,
};

const FeaturedProductsManagement = ({
  section,
  title = "Featured Section",
  subtitle = "Add or remove your products from this Home Page section, and control the order they appear in.",
  pickerTitle = "Add Your Product",
  searchPlaceholder = "Search your products by name...",
}) => {
  const dispatch = useDispatch();
  const {
    entries,
    isLoading,
    isSaving,
    error,
    availableProducts,
    isSearching,
  } = useSelector(
    (state) =>
      state.featuredProducts.seller.bySection[section] || EMPTY_SECTION_STATE,
  );

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState({});

  const loadEntries = useCallback(() => {
    dispatch(fetchFeaturedProductsSeller(section));
  }, [dispatch, section]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSellerFeaturedProductsError(section));
    }
  }, [error, dispatch, section]);

  const openPicker = () => {
    setSelectedIds({});
    setSearch("");
    dispatch(fetchAvailableProductsSeller({ section }));
    setIsPickerOpen(true);
  };

  const closePicker = () => {
    setIsPickerOpen(false);
    dispatch(clearSellerAvailableProducts(section));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchAvailableProductsSeller({ section, search }));
  };

  const toggleSelect = (productId) => {
    setSelectedIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddSelected = async () => {
    const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    if (ids.length === 0) {
      toast.error("Select at least one product");
      return;
    }
    try {
      for (const productId of ids) {
        await dispatch(
          addFeaturedProductSeller({ section, productId }),
        ).unwrap();
      }
      toast.success(
        `${ids.length} product${ids.length > 1 ? "s" : ""} added successfully`,
      );
      closePicker();
      loadEntries();
    } catch (err) {
      toast.error(err || "Failed to add product");
    }
  };

  const handleRemove = async (entry) => {
    if (
      !window.confirm(
        `Remove "${entry.product?.productName || "this product"}" from ${title}? This will not delete the product itself.`,
      )
    )
      return;
    try {
      await dispatch(removeFeaturedProductSeller(entry._id)).unwrap();
      toast.success("Product removed from section");
    } catch (err) {
      toast.error(err || "Failed to remove product");
    }
  };

  const handleToggleStatus = async (entry) => {
    try {
      await dispatch(toggleFeaturedProductStatusSeller(entry._id)).unwrap();
      toast.success(
        entry.isActive ? "Product deactivated" : "Product activated",
      );
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  const moveEntry = async (index, direction) => {
    const newEntries = [...entries];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newEntries.length) return;
    [newEntries[index], newEntries[targetIndex]] = [
      newEntries[targetIndex],
      newEntries[index],
    ];
    const orderedIds = newEntries.map((e) => e._id);
    try {
      await dispatch(
        reorderFeaturedProductsSeller({ section, orderedIds }),
      ).unwrap();
    } catch (err) {
      toast.error(err || "Failed to update order");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <button className={styles.addButton} onClick={openPicker}>
          <span>+</span> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading products...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't added any products to this section yet</p>
          <button className={styles.addButton} onClick={openPicker}>
            + Add your first product
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const product = entry.product;
                if (!product) return null;
                const displayPrice =
                  product.pricing?.salePrice || product.pricing?.originalPrice;
                return (
                  <tr key={entry._id}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={
                            product.thumbnail?.url || "/placeholder-image.jpg"
                          }
                          alt={product.productName}
                          className={styles.productThumb}
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                        <div>
                          <div className={styles.productName}>
                            {product.productName}
                          </div>
                          <div className={styles.productStatus}>
                            Catalog status: {product.status}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>₹{displayPrice?.toLocaleString() || "0"}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          entry.isActive ? styles.active : styles.inactive
                        }`}
                      >
                        {entry.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.orderControls}>
                        <button
                          className={styles.orderBtn}
                          onClick={() => moveEntry(index, -1)}
                          disabled={index === 0}
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <span className={styles.orderNumber}>{index + 1}</span>
                        <button
                          className={styles.orderBtn}
                          onClick={() => moveEntry(index, 1)}
                          disabled={index === entries.length - 1}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleToggleStatus(entry)}
                        >
                          {entry.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleRemove(entry)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isPickerOpen && (
        <div className={styles.modalOverlay} onClick={closePicker}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{pickerTitle}</h2>
              <button className={styles.closeButton} onClick={closePicker}>
                ×
              </button>
            </div>

            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </form>

            <div className={styles.pickerList}>
              {isSearching ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                </div>
              ) : availableProducts.length === 0 ? (
                <p className={styles.pickerEmpty}>
                  No published products found. Products must be Published to be
                  featured.
                </p>
              ) : (
                availableProducts.map((product) => {
                  const displayPrice =
                    product.pricing?.salePrice ||
                    product.pricing?.originalPrice;
                  const checked = Boolean(selectedIds[product._id]);
                  return (
                    <label
                      key={product._id}
                      className={`${styles.pickerRow} ${checked ? styles.pickerRowSelected : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(product._id)}
                      />
                      <img
                        src={product.thumbnail?.url || "/placeholder-image.jpg"}
                        alt={product.productName}
                        className={styles.pickerThumb}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                      <div className={styles.pickerInfo}>
                        <div className={styles.pickerName}>
                          {product.productName}
                        </div>
                        <div className={styles.pickerMeta}>
                          {product.category?.categoryData?.label ||
                            "Uncategorized"}{" "}
                          · ₹{displayPrice?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={closePicker}>
                Cancel
              </button>
              <button
                className={styles.submitButton}
                onClick={handleAddSelected}
                disabled={isSaving}
              >
                {isSaving ? "Adding..." : "Add Selected"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProductsManagement;
