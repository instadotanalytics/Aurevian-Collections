// src/Pages/Profile/tabs/AddressTab.jsx

import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiMapPin,
  FiPlusCircle,
  FiTrash2,
  FiEdit2,
  FiHome,
  FiBriefcase,
  FiMoreHorizontal,
  FiSave,
  FiX,
  FiAlertCircle,
  FiSmartphone,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../../redux/slices/profileSlice";
import styles from "../Profile.module.css";

// ── Static reference data, hoisted so it isn't rebuilt on every render ──
const MAX_ADDRESSES = 10;

const COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Switzerland",
];

const STATES = {
  India: [
    "Andhra Pradesh",
    "Karnataka",
    "Tamil Nadu",
    "Maharashtra",
    "Delhi",
    "Kerala",
    "Telangana",
    "Uttar Pradesh",
    "Rajasthan",
    "Gujarat",
  ],
  USA: [
    "California",
    "Texas",
    "New York",
    "Florida",
    "Illinois",
    "Pennsylvania",
    "Ohio",
    "Georgia",
  ],
  UK: ["England", "Scotland", "Wales", "Northern Ireland"],
  Canada: ["Ontario", "British Columbia", "Quebec", "Alberta", "Manitoba"],
  Australia: [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "South Australia",
  ],
  Germany: ["Bavaria", "Berlin", "Hesse", "North Rhine-Westphalia", "Saxony"],
  France: [
    "Île-de-France",
    "Provence-Alpes-Côte d'Azur",
    "Nouvelle-Aquitaine",
    "Auvergne-Rhône-Alpes",
  ],
  Switzerland: ["Zurich", "Bern", "Geneva", "Basel", "Lausanne"],
};

const ADDRESS_TYPES = [
  { value: "home", label: "Home", icon: FiHome },
  { value: "work", label: "Work", icon: FiBriefcase },
  { value: "other", label: "Other", icon: FiMoreHorizontal },
];

const EMPTY_ADDRESS = {
  addressType: "home",
  recipientName: "",
  mobileNumber: "",
  alternateMobile: "",
  houseNumber: "",
  apartment: "",
  street: "",
  landmark: "",
  area: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  deliveryInstructions: "",
  isDefault: false,
};

const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validatePincode = (pincode) => /^[0-9]{6}$/.test(pincode);
const validateName = (name) => /^[A-Za-z\s]{1,40}$/.test(name);

const getAddressTypeIcon = (type) => {
  const addressType = ADDRESS_TYPES.find((t) => t.value === type);
  if (addressType) {
    const Icon = addressType.icon;
    return <Icon size={16} />;
  }
  return <FiMapPin size={16} />;
};

const getAddressTypeLabel = (type) => {
  const addressType = ADDRESS_TYPES.find((t) => t.value === type);
  return addressType ? addressType.label : "Other";
};

// ── Skeleton loading (same theme, transparent bg) ──
const AddressSkeleton = () => (
  <div className={styles.addressList}>
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className={`${styles.skeletonBox} ${styles.skeletonCard}`} />
    ))}
  </div>
);

const AddressTab = () => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.profile);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [formErrors, setFormErrors] = useState({});

  // ── Scroll the page back to top after a successful add/update ──
  // (form collapses on success, which otherwise leaves the scroll
  // position sitting wherever the footer now happens to be)
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!newAddress.recipientName.trim()) {
      errors.recipientName = "Recipient name is required";
    } else if (!validateName(newAddress.recipientName)) {
      errors.recipientName =
        "Name should contain only alphabets and max 40 characters";
    }

    if (!newAddress.mobileNumber) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!validatePhone(newAddress.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (
      newAddress.alternateMobile &&
      !validatePhone(newAddress.alternateMobile)
    ) {
      errors.alternateMobile = "Alternate mobile must be 10 digits";
    }

    if (!newAddress.houseNumber.trim()) {
      errors.houseNumber = "House number is required";
    }

    if (!newAddress.street.trim()) {
      errors.street = "Street is required";
    }

    if (!newAddress.area.trim()) {
      errors.area = "Area is required";
    }

    if (!newAddress.city.trim()) {
      errors.city = "City is required";
    }

    if (!newAddress.state) {
      errors.state = "State is required";
    }

    if (!newAddress.country) {
      errors.country = "Country is required";
    }

    if (!newAddress.pincode) {
      errors.pincode = "PIN code is required";
    } else if (!validatePincode(newAddress.pincode)) {
      errors.pincode = "PIN code must be 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newAddress]);

  const handleAddressChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setNewAddress((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [formErrors],
  );

  const resetForm = useCallback(() => {
    setNewAddress(EMPTY_ADDRESS);
    setFormErrors({});
    setEditingAddressId(null);
    setShowAddressForm(false);
  }, []);

  const handleAddAddress = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (addresses?.length >= MAX_ADDRESSES) {
      toast.error(`Maximum ${MAX_ADDRESSES} addresses allowed`);
      return;
    }

    try {
      await dispatch(addAddress(newAddress)).unwrap();
      resetForm();
      scrollToTop();
    } catch (error) {
      // Error handled in slice — avoid logging address PII to the console
    }
  }, [dispatch, addresses, newAddress, validateForm, resetForm, scrollToTop]);

  const handleUpdateAddress = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await dispatch(
        updateAddress({
          id: editingAddressId,
          addressData: newAddress,
        }),
      ).unwrap();
      resetForm();
      scrollToTop();
    } catch (error) {
      // Error handled in slice
    }
  }, [
    dispatch,
    editingAddressId,
    newAddress,
    validateForm,
    resetForm,
    scrollToTop,
  ]);

  const handleDeleteAddress = useCallback(
    async (addressId) => {
      try {
        await dispatch(deleteAddress(addressId)).unwrap();
        setDeleteConfirm(null);
      } catch (error) {
        // Error handled in slice
      }
    },
    [dispatch],
  );

  const handleEditAddress = useCallback((address) => {
    setEditingAddressId(address._id);
    setNewAddress({
      addressType: address.addressType || "home",
      recipientName: address.recipientName || address.name || "",
      mobileNumber: address.mobileNumber || address.phone || "",
      alternateMobile: address.alternateMobile || "",
      // Fallback to alternate key names in case the API ever returns
      // this field under a different key — prevents the field from
      // silently going blank when opening the edit form.
      houseNumber:
        address.houseNumber || address.houseNo || address.house || "",
      apartment: address.apartment || "",
      street: address.street || "",
      landmark: address.landmark || "",
      area: address.area || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "India",
      pincode: address.pincode || "",
      deliveryInstructions: address.deliveryInstructions || "",
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  }, []);

  const handleSetDefault = useCallback(
    async (addressId) => {
      try {
        await dispatch(setDefaultAddress(addressId)).unwrap();
      } catch (error) {
        // Error handled in slice
      }
    },
    [dispatch],
  );

  if (loading && (!addresses || addresses.length === 0) && !showAddressForm) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <h2>My Addresses</h2>
        </div>
        <AddressSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>My Addresses</h2>
        <div className={styles.tabHeaderActions}>
          <span className={styles.addressCount}>
            {addresses?.length || 0} / {MAX_ADDRESSES} addresses
          </span>
          {(!addresses || addresses.length < MAX_ADDRESSES) && (
            <button
              className={styles.editBtn}
              onClick={() => {
                resetForm();
                setShowAddressForm(!showAddressForm);
              }}
            >
              <FiPlusCircle size={16} /> Add Address
            </button>
          )}
        </div>
      </div>

      {showAddressForm && (
        <div className={styles.addressForm}>
          <h3>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

          {/* Address Type */}
          <div className={styles.addressTypeSelector}>
            <label>Address Type</label>
            <div className={styles.addressTypeOptions}>
              {ADDRESS_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    className={`${styles.addressTypeBtn} ${
                      newAddress.addressType === type.value ? styles.active : ""
                    }`}
                    onClick={() =>
                      setNewAddress((prev) => ({ ...prev, addressType: type.value }))
                    }
                  >
                    <Icon size={20} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Recipient Name *</label>
              <input
                type="text"
                name="recipientName"
                value={newAddress.recipientName}
                onChange={handleAddressChange}
                placeholder="Full Name"
                className={formErrors.recipientName ? styles.errorInput : ""}
              />
              {formErrors.recipientName && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.recipientName}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Mobile Number *</label>
              <input
                type="tel"
                name="mobileNumber"
                value={newAddress.mobileNumber}
                onChange={handleAddressChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={formErrors.mobileNumber ? styles.errorInput : ""}
              />
              {formErrors.mobileNumber && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.mobileNumber}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Alternate Mobile</label>
              <input
                type="tel"
                name="alternateMobile"
                value={newAddress.alternateMobile}
                onChange={handleAddressChange}
                placeholder="Optional"
                maxLength={10}
                className={formErrors.alternateMobile ? styles.errorInput : ""}
              />
              {formErrors.alternateMobile && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.alternateMobile}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>House Number / Building *</label>
              <input
                type="text"
                name="houseNumber"
                value={newAddress.houseNumber}
                onChange={handleAddressChange}
                placeholder="House number, building name"
                className={formErrors.houseNumber ? styles.errorInput : ""}
              />
              {formErrors.houseNumber && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.houseNumber}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Apartment / Suite</label>
              <input
                type="text"
                name="apartment"
                value={newAddress.apartment}
                onChange={handleAddressChange}
                placeholder="Apartment number (optional)"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Street / Road *</label>
              <input
                type="text"
                name="street"
                value={newAddress.street}
                onChange={handleAddressChange}
                placeholder="Street name"
                className={formErrors.street ? styles.errorInput : ""}
              />
              {formErrors.street && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.street}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Landmark</label>
              <input
                type="text"
                name="landmark"
                value={newAddress.landmark}
                onChange={handleAddressChange}
                placeholder="Nearby landmark (optional)"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Area / Locality *</label>
              <input
                type="text"
                name="area"
                value={newAddress.area}
                onChange={handleAddressChange}
                placeholder="Area or locality"
                className={formErrors.area ? styles.errorInput : ""}
              />
              {formErrors.area && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.area}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleAddressChange}
                placeholder="City"
                className={formErrors.city ? styles.errorInput : ""}
              />
              {formErrors.city && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.city}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>State *</label>
              <select
                name="state"
                value={newAddress.state}
                onChange={handleAddressChange}
                className={formErrors.state ? styles.errorInput : ""}
              >
                <option value="">Select State</option>
                {STATES[newAddress.country]?.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {formErrors.state && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.state}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Country *</label>
              <select
                name="country"
                value={newAddress.country}
                onChange={handleAddressChange}
                className={formErrors.country ? styles.errorInput : ""}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {formErrors.country && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.country}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>PIN Code *</label>
              <input
                type="text"
                name="pincode"
                value={newAddress.pincode}
                onChange={handleAddressChange}
                placeholder="6-digit PIN code"
                maxLength={6}
                className={formErrors.pincode ? styles.errorInput : ""}
              />
              {formErrors.pincode && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle size={14} /> {formErrors.pincode}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Delivery Instructions</label>
            <textarea
              name="deliveryInstructions"
              value={newAddress.deliveryInstructions}
              onChange={handleAddressChange}
              placeholder="Any special delivery instructions (optional)"
              rows="2"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isDefault"
                checked={newAddress.isDefault}
                onChange={handleAddressChange}
              />
              Set as default address
            </label>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.saveBtn}
              onClick={
                editingAddressId ? handleUpdateAddress : handleAddAddress
              }
              disabled={loading}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <FiSave size={16} />
                  {editingAddressId ? "Update Address" : "Add Address"}
                </>
              )}
            </button>
            <button className={styles.cancelBtn} onClick={resetForm}>
              <FiX size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {addresses && addresses.length > 0 ? (
        <div className={styles.addressList}>
          {addresses.map((address) => (
            <div key={address._id} className={styles.addressCard}>
              <div className={styles.addressTypeBadge}>
                {getAddressTypeIcon(address.addressType || "home")}
                <span>
                  {getAddressTypeLabel(address.addressType || "home")}
                </span>
                {address.isDefault && (
                  <span className={styles.addressDefault}>Default</span>
                )}
              </div>

              <div className={styles.addressDetails}>
                <div className={styles.addressHeader}>
                  <span className={styles.addressName}>
                    {address.recipientName || address.name}
                  </span>
                </div>
                <p className={styles.addressLine}>
                  {address.houseNumber && `${address.houseNumber}, `}
                  {address.street}
                </p>
                {address.landmark && (
                  <p className={styles.addressLine}>Near: {address.landmark}</p>
                )}
                <p className={styles.addressLine}>
                  {address.area}, {address.city}, {address.state} -{" "}
                  {address.pincode}
                </p>
                <p className={styles.addressLine}>{address.country}</p>
                <p className={styles.addressPhone}>
                  <span><FiSmartphone size={13} /> {address.mobileNumber || address.phone}</span>
                  {address.alternateMobile && (
                    <span className={styles.alternatePhone}>
                      (Alt: {address.alternateMobile})
                    </span>
                  )}
                </p>
                {address.deliveryInstructions && (
                  <p className={styles.deliveryInstructions}>
                    <FiFileText size={13} /> {address.deliveryInstructions}
                  </p>
                )}
              </div>

              <div className={styles.addressActions}>
                {!address.isDefault && (
                  <button
                    className={styles.addressDefaultBtn}
                    onClick={() => handleSetDefault(address._id)}
                    disabled={loading}
                  >
                    Set Default
                  </button>
                )}
                <button
                  className={styles.addressEditBtn}
                  onClick={() => handleEditAddress(address)}
                  disabled={loading}
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button
                  className={styles.addressDeleteBtn}
                  onClick={() => setDeleteConfirm(address._id)}
                  disabled={loading}
                  aria-label="Delete address"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              {/* Delete Confirmation Modal */}
              {deleteConfirm === address._id && (
                <div className={styles.deleteConfirmOverlay}>
                  <div className={styles.deleteConfirmModal}>
                    <h4>Delete Address?</h4>
                    <p>
                      Are you sure you want to delete this address?
                      {address.isDefault && (
                        <span className={styles.warningText}>
                          {" "}
                          This is your default address.
                        </span>
                      )}
                    </p>
                    <div className={styles.deleteConfirmActions}>
                      <button
                        className={styles.confirmDeleteBtn}
                        onClick={() => handleDeleteAddress(address._id)}
                        disabled={loading}
                      >
                        <FiTrash2 size={16} /> Delete
                      </button>
                      <button
                        className={styles.cancelDeleteBtn}
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FiMapPin size={48} />
          <h3>No addresses saved</h3>
          <p>Add your first address for faster checkout</p>
        </div>
      )}
    </div>
  );
};

export default AddressTab;