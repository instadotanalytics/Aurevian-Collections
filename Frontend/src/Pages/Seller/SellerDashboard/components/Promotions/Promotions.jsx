// src/Pages/Seller/SellerDashboard/components/Promotions/Promotions.jsx — NEW FILE

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiLock, FiCheck, FiX, FiClock, FiTrash2 } from "react-icons/fi";
import {
  fetchPromotionGuidelines,
  fetchSellerEntitlements,
  fetchSellerPromotionRequests,
  fetchSellerAvailableProductsForPromotion,
  submitPromotionRequest,
  cancelPromotionRequest,
  clearSellerPromotionError,
  clearSellerAvailableProductsForPromotion,
} from "../../../../../redux/slices/promotionSlice";
import styles from "./Promotions.module.css";

const STATUS_META = {
  pending: { label: "Pending Review", className: "pending" },
  approved: { label: "Active on Homepage", className: "approved" },
  rejected: { label: "Rejected", className: "rejected" },
  removed: { label: "Removed by Admin", className: "removed" },
};

const Promotions = ({
  section,
  title = "Homepage Promotion",
  subtitle = "Submit your products for review to appear in this section on the homepage.",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { guidelines, seller } = useSelector((state) => state.promotions);
  const {
    entitlements,
    requestsBySection,
    availableProducts,
    isSearching,
    isSubmitting,
    error,
  } = seller;

  const requests = requestsBySection[section] || [];
  const sectionGuidelines = guidelines[section];

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const loadAll = useCallback(() => {
    dispatch(fetchPromotionGuidelines());
    dispatch(fetchSellerEntitlements());
    dispatch(fetchSellerPromotionRequests(section));
  }, [dispatch, section]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error.message || "Something went wrong",
      );
      dispatch(clearSellerPromotionError());
    }
  }, [error, dispatch]);

  const isEligible = !!entitlements?.homepagePromotion?.enabled;
  const limit = entitlements?.homepagePromotion?.limit ?? 0;
  const used = entitlements?.usage?.[section] ?? 0;
  const isUnlimited = limit === -1;
  const limitReached = !isUnlimited && used >= limit;

  const openPicker = () => {
    setSearch("");
    dispatch(fetchSellerAvailableProductsForPromotion({ section }));
    setIsPickerOpen(true);
  };

  const closePicker = () => {
    setIsPickerOpen(false);
    dispatch(clearSellerAvailableProductsForPromotion());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchSellerAvailableProductsForPromotion({ section, search }));
  };

  const handleSubmit = async (productId) => {
    try {
      await dispatch(submitPromotionRequest({ section, productId })).unwrap();
      toast.success("Promotion request submitted for review");
      closePicker();
      dispatch(fetchSellerEntitlements());
    } catch (err) {
      const message = err?.message || err || "Failed to submit request";
      toast.error(message);
      if (err?.errors?.length) {
        err.errors.forEach((e) => toast.error(e));
      }
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this pending promotion request?")) return;
    try {
      await dispatch(cancelPromotionRequest(id)).unwrap();
      toast.success("Request cancelled");
      dispatch(fetchSellerEntitlements());
    } catch (err) {
      toast.error(err || "Failed to cancel request");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {isEligible && (
          <button
            className={styles.addButton}
            onClick={openPicker}
            disabled={limitReached}
            title={limitReached ? "Promotion limit reached for your plan" : ""}
          >
            + Submit Product
          </button>
        )}
      </div>

      {!isEligible ? (
        <div className={styles.lockedState}>
          <FiLock size={32} className={styles.lockIcon} />
          <h3>Available on Gold and Platinum</h3>
          <p>
            This section requires Gold or Platinum membership. Upgrade your plan
            to submit products for homepage promotion.
          </p>
          <button
            className={styles.upgradeButton}
            onClick={() => navigate("/seller/dashboard/upgrade")}
          >
            View Plans
          </button>
        </div>
      ) : (
        <>
          <div className={styles.usageBar}>
            <span>
              {used} {isUnlimited ? "" : `of ${limit}`} promotion slot
              {used === 1 ? "" : "s"} used
              {isUnlimited ? " (unlimited on your plan)" : ""}
            </span>
          </div>

          {sectionGuidelines && (
            <div className={styles.guidelinesCard}>
              <h4>{sectionGuidelines.title}</h4>
              <ul>
                {sectionGuidelines.rules.map((rule, i) => (
                  <li key={i}>
                    <FiCheck size={13} /> {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requests.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't submitted any products to this section yet</p>
              <button className={styles.addButton} onClick={openPicker}>
                + Submit your first product
              </button>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const product = r.product;
                    const meta = STATUS_META[r.status] || {
                      label: r.status,
                      className: "pending",
                    };
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className={styles.productCell}>
                            <img
                              src={
                                product?.thumbnail?.url ||
                                "/placeholder-image.jpg"
                              }
                              alt={product?.productName}
                              className={styles.productThumb}
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            <span>{product?.productName || "Product"}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${styles[meta.className]}`}
                          >
                            {meta.label}
                          </span>
                          {r.status === "rejected" && r.rejectionReason && (
                            <div className={styles.rejectionReason}>
                              Reason: {r.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          {r.status === "pending" && (
                            <button
                              className={styles.cancelBtn}
                              onClick={() => handleCancel(r._id)}
                            >
                              <FiTrash2 size={13} /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {isPickerOpen && (
        <div className={styles.modalOverlay} onClick={closePicker}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Submit a Product</h2>
              <button className={styles.closeButton} onClick={closePicker}>
                ×
              </button>
            </div>

            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Search your products by name..."
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
                  No eligible products found. Products must be Published,
                  active, priced, and in stock.
                </p>
              ) : (
                availableProducts.map((product) => {
                  const displayPrice =
                    product.pricing?.salePrice ||
                    product.pricing?.originalPrice;
                  return (
                    <div key={product._id} className={styles.pickerRow}>
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
                          ₹{displayPrice?.toLocaleString() || "0"}
                        </div>
                      </div>
                      <button
                        className={styles.submitRowButton}
                        onClick={() => handleSubmit(product._id)}
                        disabled={isSubmitting}
                      >
                        Submit
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
