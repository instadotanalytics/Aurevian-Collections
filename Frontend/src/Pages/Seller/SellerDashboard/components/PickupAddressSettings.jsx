import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMapPin,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiRefreshCw,
  FiCrosshair,
} from "react-icons/fi";
import toast from "react-hot-toast";

import {
  updateSellerPickupAddress,
  retrySellerPickupSync,
} from "../../../../redux/slices/sellerSlice";
import styles from "./PickupAddressSettings.module.css";

const EMPTY_FORM = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  latitude: "",
  longitude: "",
};

const SYNC_STATUS_META = {
  synced: { label: "Synced with Shiprocket", icon: FiCheckCircle, ok: true },
  pending: { label: "Pending Shiprocket Sync", icon: FiClock, ok: false },
  failed: { label: "Shiprocket Sync Failed", icon: FiAlertTriangle, ok: false },
  not_synced: { label: "Saved — Not Yet Synced", icon: FiClock, ok: false },
};

const PickupAddressSettings = () => {
  const dispatch = useDispatch();
  const { seller, isLoading } = useSelector((state) => state.seller);

  const [form, setForm] = useState(EMPTY_FORM);
  const [retrying, setRetrying] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (seller?.pickupAddress) {
      setForm({
        contactName: seller.pickupAddress.contactName || "",
        contactPhone: seller.pickupAddress.contactPhone || "",
        contactEmail: seller.pickupAddress.contactEmail || "",
        addressLine1: seller.pickupAddress.addressLine1 || "",
        addressLine2: seller.pickupAddress.addressLine2 || "",
        city: seller.pickupAddress.city || "",
        state: seller.pickupAddress.state || "",
        pincode: seller.pickupAddress.pincode || "",
        country: seller.pickupAddress.country || "India",
        latitude:
          seller.pickupAddress.coordinates?.lat != null
            ? String(seller.pickupAddress.coordinates.lat)
            : "",
        longitude:
          seller.pickupAddress.coordinates?.lng != null
            ? String(seller.pickupAddress.coordinates.lng)
            : "",
      });
    }
  }, [seller?.pickupAddress]);

  const hasSavedAddress = !!seller?.pickupAddress?.addressLine1;
  const syncStatus =
    seller?.pickupAddress?.shiprocketSyncStatus || "not_synced";
  const statusMeta =
    SYNC_STATUS_META[syncStatus] || SYNC_STATUS_META.not_synced;
  const StatusIcon = statusMeta.icon;

  const hasCoordinates =
    seller?.pickupAddress?.coordinates?.lat != null &&
    seller?.pickupAddress?.coordinates?.lng != null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Location isn't supported on this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        }));
        setLocating(false);
        toast.success("Showroom location captured. Review and Save.");
      },
      () => {
        setLocating(false);
        toast.error(
          "Couldn't get your current location. You can enter it manually below.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { ...form };
    // Only send latitude/longitude if the seller actually provided both —
    // omitting them entirely preserves any previously saved coordinates
    // (see Backend/controllers/sellerController.js updateSellerPickupAddress).
    if (form.latitude === "" || form.longitude === "") {
      delete payload.latitude;
      delete payload.longitude;
    }

    dispatch(updateSellerPickupAddress(payload));
  };

  const handleRetry = async () => {
    setRetrying(true);
    await dispatch(retrySellerPickupSync());
    setRetrying(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FiMapPin size={20} />
        </div>
        <div>
          <h2 className={styles.title}>Pickup Address</h2>
          <p className={styles.subtitle}>
            This is the warehouse/pickup address couriers will collect your
            orders from. It's saved to your account the moment you click Save —
            Shiprocket synchronization happens separately and can be retried
            anytime.
          </p>
        </div>
      </div>

      {hasSavedAddress && (
        <div
          className={`${styles.statusBanner} ${statusMeta.ok ? styles.statusOk : styles.statusPending
            }`}
        >
          <StatusIcon size={16} />
          <span>{statusMeta.label}</span>
          {syncStatus === "failed" &&
            seller.pickupAddress.shiprocketSyncError && (
              <span
                style={{
                  display: "block",
                  fontSize: 12,
                  opacity: 0.8,
                  marginTop: 4,
                }}
              >
                {seller.pickupAddress.shiprocketSyncError}
              </span>
            )}
          {syncStatus !== "synced" && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: "transparent",
                cursor: retrying ? "default" : "pointer",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              <FiRefreshCw size={14} />
              {retrying ? "Retrying..." : "Retry Shiprocket Sync"}
            </button>
          )}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Contact Name *</label>
            <input
              type="text"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              placeholder="Warehouse contact person"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Contact Phone *</label>
            <input
              type="tel"
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="Defaults to your account email"
            />
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label>Address Line 1 *</label>
            <input
              type="text"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="Building, street, area"
              required
            />
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label>Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Landmark, floor, etc. (optional)"
            />
          </div>

          <div className={styles.field}>
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              maxLength={6}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ✅ NEW — showroom coordinates, independent of Shiprocket sync.
            Used only for customer-facing distance/zone ranking (never
            exposes exact coordinates to customers — see backend
            attachLocationInfo). Optional: leaving both blank preserves
            whatever was previously saved. */}
        <div className={styles.showroomSection}>
          <div className={styles.showroomHeader}>
            <span className={styles.showroomTitle}>
              Showroom Location {hasCoordinates && "✅"}
            </span>
            <button
              type="button"
              className={styles.locateBtn}
              onClick={handleUseCurrentLocation}
              disabled={locating}
            >
              <FiCrosshair size={14} />
              {locating ? "Locating..." : "Use Current Location"}
            </button>
          </div>
          <p className={styles.showroomHint}>
            Used to show customers how far your products are from them.
            Optional — leave blank to keep it unset, or unchanged if already
            saved.
          </p>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 23.2599"
                min={-90}
                max={90}
              />
            </div>
            <div className={styles.field}>
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 77.4126"
                min={-180}
                max={180}
              />
            </div>
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Pickup Address"}
        </button>
      </form>
    </div>
  );
};

export default PickupAddressSettings;