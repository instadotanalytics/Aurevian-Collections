// src/Pages/Profile/tabs/AddressTab.jsx

import React, { useState } from "react";
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
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../../redux/slices/profileSlice";
import styles from "../Profile.module.css";

const AddressTab = () => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.profile);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [newAddress, setNewAddress] = useState({
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
  });

  const [formErrors, setFormErrors] = useState({});

  const MAX_ADDRESSES = 10;

  const countries = [
    "India",
    "USA",
    "UK",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Switzerland",
  ];

  const states = {
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

  const addressTypes = [
    { value: "home", label: "Home", icon: FiHome },
    { value: "work", label: "Work", icon: FiBriefcase },
    { value: "other", label: "Other", icon: FiMoreHorizontal },
  ];

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
  };

  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s]{1,40}$/;
    return nameRegex.test(name);
  };

  const validateForm = () => {
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
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setNewAddress({
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
    });
    setFormErrors({});
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  // In AddressTab.jsx - add this to handleAddAddress

  const handleAddAddress = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (addresses?.length >= MAX_ADDRESSES) {
      toast.error(`Maximum ${MAX_ADDRESSES} addresses allowed`);
      return;
    }

    try {
      console.log("📦 Sending address data:", newAddress);
      const result = await dispatch(addAddress(newAddress)).unwrap();
      console.log("✅ Address added successfully:", result);
      resetForm();
    } catch (error) {
      console.error("❌ Failed to add address:", error);
      // Error handled in slice
    }
  };

  const handleUpdateAddress = async () => {
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
    } catch (error) {
      // Error handled in slice
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await dispatch(deleteAddress(addressId)).unwrap();
      setDeleteConfirm(null);
    } catch (error) {
      // Error handled in slice
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setNewAddress({
      addressType: address.addressType || "home",
      recipientName: address.recipientName || address.name || "",
      mobileNumber: address.mobileNumber || address.phone || "",
      alternateMobile: address.alternateMobile || "",
      houseNumber: address.houseNumber || "",
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
  };

  const handleSetDefault = async (addressId) => {
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap();
    } catch (error) {
      // Error handled in slice
    }
  };

  const getAddressTypeIcon = (type) => {
    const addressType = addressTypes.find((t) => t.value === type);
    if (addressType) {
      const Icon = addressType.icon;
      return <Icon size={16} />;
    }
    return <FiMapPin size={16} />;
  };

  const getAddressTypeLabel = (type) => {
    const addressType = addressTypes.find((t) => t.value === type);
    return addressType ? addressType.label : "Other";
  };

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
              {addressTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    className={`${styles.addressTypeBtn} ${
                      newAddress.addressType === type.value ? styles.active : ""
                    }`}
                    onClick={() =>
                      setNewAddress({ ...newAddress, addressType: type.value })
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
                {states[newAddress.country]?.map((state) => (
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
                {countries.map((country) => (
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
                  <span>📱 {address.mobileNumber || address.phone}</span>
                  {address.alternateMobile && (
                    <span className={styles.alternatePhone}>
                      (Alt: {address.alternateMobile})
                    </span>
                  )}
                </p>
                {address.deliveryInstructions && (
                  <p className={styles.deliveryInstructions}>
                    📝 {address.deliveryInstructions}
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
