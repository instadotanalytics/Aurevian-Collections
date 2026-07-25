// src/Pages/SuperAdmin/components/SubscriptionPlanManagement/SubscriptionPlanManagement.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPlans,
  createPlan,
  updatePlan,
  togglePlanStatus,
  deletePlan,
  clearSubscriptionPlanError,
} from "../../../../redux/slices/subscriptionPlanSlice";
import styles from "./SubscriptionPlanManagement.module.css";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";

const emptyForm = {
  id: "",
  name: "",
  icon: "🟢",
  price: 0,
  priceDisplay: "",
  bestFor: "",
  isPopular: false,
  badge: "",
  commissionRate: 0,
  settlementDays: 0,
  productLimit: 0,
  imagesPerProduct: 1,
  supportLevel: "Email",
  sellerLevel: "basic",
  isSuperSeller: false,
  durationDays: 30,
  featuresText: "",
};

const formatPaise = (paise) => `₹${(paise / 100).toLocaleString("en-IN")}`;

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const SubscriptionPlanManagement = () => {
  const dispatch = useDispatch();
  const { plans, isLoading, isSaving, error } = useSelector(
    (state) => state.subscriptionPlans,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // null = creating new
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchAllPlans());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSubscriptionPlanError());
    }
  }, [error, dispatch]);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      id: plan.id,
      name: plan.name || "",
      icon: plan.icon || "🟢",
      price: plan.price ?? 0,
      priceDisplay: plan.priceDisplay || "",
      bestFor: plan.bestFor || "",
      isPopular: !!plan.isPopular,
      badge: plan.badge || "",
      commissionRate: plan.commissionRate ?? 0,
      settlementDays: plan.settlementDays ?? 0,
      productLimit: plan.productLimit ?? 0,
      imagesPerProduct: plan.imagesPerProduct ?? 1,
      supportLevel: plan.supportLevel || "Email",
      sellerLevel: plan.sellerLevel || "basic",
      isSuperSeller: !!plan.isSuperSeller,
      durationDays: plan.durationDays || 30,
      featuresText: (plan.features || []).join("\n"),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-fill the slug from the name only while creating, and only
      // if the person hasn't hand-edited the id field themselves.
      id: !editingPlan ? slugify(name) : prev.id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      icon: formData.icon,
      price: Number(formData.price),
      priceDisplay: formData.priceDisplay,
      bestFor: formData.bestFor,
      isPopular: formData.isPopular,
      badge: formData.badge || null,
      commissionRate: Number(formData.commissionRate),
      settlementDays: Number(formData.settlementDays),
      productLimit: Number(formData.productLimit),
      imagesPerProduct: Number(formData.imagesPerProduct),
      supportLevel: formData.supportLevel,
      sellerLevel: formData.sellerLevel,
      isSuperSeller: formData.isSuperSeller,
      durationDays: Number(formData.durationDays),
      features: formData.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    try {
      if (editingPlan) {
        await dispatch(
          updatePlan({ id: editingPlan.id, planData: payload }),
        ).unwrap();
        toast.success(`${payload.name} plan updated`);
      } else {
        if (!formData.id) {
          toast.error("Plan id is required");
          return;
        }
        await dispatch(createPlan({ id: formData.id, ...payload })).unwrap();
        toast.success(`${payload.name} plan created`);
      }
      closeModal();
    } catch (err) {
      toast.error(err || "Failed to save plan");
    }
  };

  const handleToggle = async (plan) => {
    try {
      const result = await dispatch(togglePlanStatus(plan.id)).unwrap();
      toast.success(
        `${result.name} is now ${result.isActive ? "active" : "inactive"}`,
      );
    } catch (err) {
      toast.error(err || "Failed to toggle plan status");
    }
  };

  const handleDelete = async (plan) => {
    if (
      !window.confirm(
        `Delete the "${plan.name}" plan? Sellers currently on it will keep their benefits until expiry, but no one will be able to purchase it again.`,
      )
    ) {
      return;
    }
    try {
      await dispatch(deletePlan(plan.id)).unwrap();
      toast.success(`${plan.name} plan deleted`);
    } catch (err) {
      toast.error(err || "Failed to delete plan");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Subscription Plan Management</h1>
          <p className={styles.subtitle}>
            Control the pricing, limits, and features sellers see on the Upgrade
            page
          </p>
        </div>
        <button className={styles.createButton} onClick={openCreate}>
          <FiPlus size={18} />
          <span>Add New Plan</span>
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No plans set up yet</p>
          <button className={styles.createButton} onClick={openCreate}>
            Create your first plan
          </button>
        </div>
      ) : (
        <div className={styles.planGrid}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.planCard} ${plan.isPopular ? styles.popular : ""} ${
                !plan.isActive ? styles.inactive : ""
              }`}
            >
              {plan.isPopular && (
                <div className={styles.popularBadge}>⭐ Recommended</div>
              )}
              {plan.isSystemPlan && (
                <div className={styles.systemBadge}>System</div>
              )}

              <div className={styles.planIcon}>{plan.icon}</div>
              <h3 className={styles.planName}>{plan.name}</h3>
              <span className={styles.planSlug}>id: {plan.id}</span>

              <div className={styles.planPrice}>
                {formatPaise(plan.price)}
                <span className={styles.period}>/ month</span>
              </div>
              <span className={styles.bestFor}>{plan.bestFor}</span>

              <div className={styles.planStats}>
                <span>{plan.commissionRate}% commission</span>
                <span>{plan.settlementDays}d settlement</span>
                <span>
                  {plan.productLimit === -1 ? "Unlimited" : plan.productLimit}{" "}
                  products
                </span>
              </div>

              <ul className={styles.featureList}>
                {(plan.features || []).slice(0, 4).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
                {plan.features?.length > 4 && (
                  <li className={styles.moreFeatures}>
                    +{plan.features.length - 4} more
                  </li>
                )}
              </ul>

              <div className={styles.statusRow}>
                <span
                  className={`${styles.statusBadge} ${
                    plan.isActive ? styles.active : styles.inactiveBadge
                  }`}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.editButton}
                  onClick={() => openEdit(plan)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.toggleButton} ${
                    plan.isSystemPlan && plan.isActive
                      ? styles.disabledToggle
                      : ""
                  }`}
                  onClick={() => handleToggle(plan)}
                  disabled={plan.isSystemPlan && plan.isActive}
                  title={
                    plan.isSystemPlan && plan.isActive
                      ? "This plan can't be deactivated"
                      : ""
                  }
                >
                  {plan.isActive ? "Deactivate" : "Activate"}
                </button>
                {!plan.isSystemPlan && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(plan)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {editingPlan ? `Edit ${editingPlan.name}` : "Add New Plan"}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Plan Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Icon (emoji)</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Plan ID (slug) *</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={!!editingPlan}
                  placeholder="e.g. black-diamond"
                  required
                />
                <p className={styles.hint}>
                  {editingPlan
                    ? "The plan id can't be changed after creation."
                    : "Lowercase letters, numbers, and hyphens only. Auto-filled from the name — edit if needed."}
                </p>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price (in paise) *</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  <p className={styles.hint}>e.g. 49900 = ₹499</p>
                </div>
                <div className={styles.formGroup}>
                  <label>Price Display *</label>
                  <input
                    type="text"
                    name="priceDisplay"
                    placeholder="₹499"
                    value={formData.priceDisplay}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Best For</label>
                <input
                  type="text"
                  name="bestFor"
                  placeholder="Growing sellers"
                  value={formData.bestFor}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Badge Text</label>
                <input
                  type="text"
                  name="badge"
                  placeholder="Silver Verified Badge"
                  value={formData.badge}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Commission Rate (%) *</label>
                  <input
                    type="number"
                    name="commissionRate"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Settlement Days *</label>
                  <input
                    type="number"
                    name="settlementDays"
                    min="0"
                    value={formData.settlementDays}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Product Limit *</label>
                  <input
                    type="number"
                    name="productLimit"
                    value={formData.productLimit}
                    onChange={handleChange}
                    required
                  />
                  <p className={styles.hint}>-1 = unlimited</p>
                </div>
                <div className={styles.formGroup}>
                  <label>Images per Product *</label>
                  <input
                    type="number"
                    name="imagesPerProduct"
                    min="1"
                    value={formData.imagesPerProduct}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Support Level</label>
                  <select
                    name="supportLevel"
                    value={formData.supportLevel}
                    onChange={handleChange}
                  >
                    <option value="Email">Email</option>
                    <option value="Chat">Chat</option>
                    <option value="Phone">Phone</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Seller Level</label>
                  <select
                    name="sellerLevel"
                    value={formData.sellerLevel}
                    onChange={handleChange}
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Duration (days) *</label>
                <input
                  type="number"
                  name="durationDays"
                  min="1"
                  value={formData.durationDays}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Features (one per line)</label>
                <textarea
                  name="featuresText"
                  rows={6}
                  value={formData.featuresText}
                  onChange={handleChange}
                  placeholder={
                    "300 Products\nSilver Verified Badge\nChat Support"
                  }
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={handleChange}
                    />
                    Mark as "Recommended"
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isSuperSeller"
                      checked={formData.isSuperSeller}
                      onChange={handleChange}
                    />
                    Grants Super Seller status
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingPlan
                      ? "Update Plan"
                      : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlanManagement;
