// src/Pages/Seller/SellerDashboard/Settings.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiBell,
  FiGlobe,
  FiCreditCard,
  FiShield,
  FiLogOut,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle,
  FiSave,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiSmartphone,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiToggleLeft,
  FiToggleRight,
  FiInfo,
  FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./Settings.module.css";

// ============================================
// THROTTLE & DEBOUNCE UTILITIES
// ============================================
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// ============================================
// SKELETON LOADER
// ============================================
const SkeletonLoader = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.skeletonTabs}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonTab} />
        ))}
      </div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonSection} />
        <div className={styles.skeletonSection} />
        <div className={styles.skeletonSection} />
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refs
  const refreshThrottleRef = useRef(null);
  const saveDebounceRef = useRef(null);

  // ============================================
  // STATE - Profile
  // ============================================
  const [profile, setProfile] = useState({
    firstName: "Gold",
    lastName: "Seller",
    email: "gold.seller@aurevian.com",
    phone: "+91 98765 43210",
    address: "123, Jewelry District, Mumbai - 400001",
    bio: "Premium jewelry seller specializing in gold and diamond ornaments.",
    storeName: "Aurevian Collections",
    storeUrl: "aurevian-collections",
  });

  // ============================================
  // STATE - Security
  // ============================================
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
    devices: [
      { name: "Chrome on Windows", location: "Mumbai, India", lastActive: "2024-12-18 14:30", current: true },
      { name: "Safari on iPhone", location: "Mumbai, India", lastActive: "2024-12-17 09:15", current: false },
      { name: "Firefox on Mac", location: "Delhi, India", lastActive: "2024-12-15 22:45", current: false },
    ],
  });

  // ============================================
  // STATE - Notifications
  // ============================================
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    paymentReceived: true,
    payoutCompleted: true,
    newReviews: true,
    marketingEmails: false,
    productAlerts: true,
    inventoryLow: true,
    systemUpdates: false,
  });

  // ============================================
  // STATE - Payments
  // ============================================
  const [payments, setPayments] = useState({
    bankName: "HDFC Bank",
    accountNumber: "1234567890",
    accountHolder: "Gold Seller",
    ifscCode: "HDFC0001234",
    upiId: "gold.seller@hdfc",
    payoutFrequency: "weekly",
    minimumPayout: "1000",
    taxId: "GSTIN1234567890",
    panNumber: "ABCDE1234F",
  });

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchSettingsData = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setError(null);
    } catch (err) {
      setError("Failed to load settings");
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ============================================
  // THROTTLED REFRESH
  // ============================================
  const handleRefresh = useCallback(() => {
    if (refreshThrottleRef.current) return;

    refreshThrottleRef.current = throttle(() => {
      setRefreshing(true);
      fetchSettingsData();
      refreshThrottleRef.current = null;
    }, 2000)();

    setTimeout(() => {
      refreshThrottleRef.current = null;
    }, 2000);
  }, [fetchSettingsData]);

  // ============================================
  // DEBOUNCED SAVE
  // ============================================
  const handleSave = useCallback((section, data) => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }

    setSaving(true);
    saveDebounceRef.current = setTimeout(() => {
      // Simulate save
      toast.success(`${section} settings saved successfully!`);
      setSaving(false);
      saveDebounceRef.current = null;
    }, 800);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    fetchSettingsData();

    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
    };
  }, [fetchSettingsData]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayments((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle2FA = () => {
    setSecurity((prev) => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled,
    }));
    toast.success(`2FA ${!security.twoFactorEnabled ? "enabled" : "disabled"}`);
  };

  // ============================================
  // TABS
  // ============================================
  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "security", label: "Security", icon: FiLock },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "payments", label: "Payments", icon: FiCreditCard },
    { id: "store", label: "Store", icon: FiGlobe },
  ];

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className={styles.container}>
        <SkeletonLoader />
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <FiAlertCircle size={48} />
          <h2>{error}</h2>
          <p>Please try again later</p>
          <button onClick={handleRefresh} className={styles.retryBtn}>
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER CONTENT
  // ============================================
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfile();
      case "security":
        return renderSecurity();
      case "notifications":
        return renderNotifications();
      case "payments":
        return renderPayments();
      case "store":
        return renderStore();
      default:
        return null;
    }
  };

  // ============================================
  // RENDER - Profile
  // ============================================
  const renderProfile = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Personal Information</h3>
        <p>Update your personal details and contact information</p>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleProfileChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleProfileChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
            />
          </div>
          <div className={styles.formGroupFull}>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleProfileChange}
            />
          </div>
          <div className={styles.formGroupFull}>
            <label>Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleProfileChange}
              rows="3"
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.saveBtn}
            onClick={() => handleSave("Profile", profile)}
            disabled={saving}
          >
            <FiSave size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER - Security
  // ============================================
  const renderSecurity = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Change Password</h3>
        <p>Update your password to keep your account secure</p>

        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label>Current Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                name="currentPassword"
                value={security.currentPassword}
                onChange={handleSecurityChange}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={security.newPassword}
              onChange={handleSecurityChange}
              placeholder="Enter new password"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={security.confirmPassword}
              onChange={handleSecurityChange}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.saveBtn}
            onClick={() => handleSave("Security", security)}
            disabled={saving}
          >
            <FiSave size={16} />
            {saving ? "Saving..." : "Update Password"}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Two-Factor Authentication</h3>
            <p>Add an extra layer of security to your account</p>
          </div>
          <button
            className={`${styles.toggleBtn} ${security.twoFactorEnabled ? styles.active : ""}`}
            onClick={handleToggle2FA}
          >
            {security.twoFactorEnabled ? (
              <>
                <FiToggleRight size={24} />
                Enabled
              </>
            ) : (
              <>
                <FiToggleLeft size={24} />
                Disabled
              </>
            )}
          </button>
        </div>
        {security.twoFactorEnabled && (
          <div className={styles.twoFactorInfo}>
            <FiInfo size={16} />
            <span>2FA is enabled. Your account is protected with an authenticator app.</span>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Active Devices</h3>
        <p>Devices that are currently logged into your account</p>
        <div className={styles.deviceList}>
          {security.devices.map((device, index) => (
            <div key={index} className={styles.deviceItem}>
              <div className={styles.deviceIcon}>
                <FiSmartphone size={18} />
              </div>
              <div className={styles.deviceInfo}>
                <span className={styles.deviceName}>
                  {device.name}
                  {device.current && (
                    <span className={styles.currentDevice}>Current</span>
                  )}
                </span>
                <span className={styles.deviceLocation}>
                  <FiMapPin size={12} />
                  {device.location}
                </span>
                <span className={styles.deviceTime}>
                  <FiClock size={12} />
                  Last active: {device.lastActive}
                </span>
              </div>
              {!device.current && (
                <button className={styles.deviceRemove}>Remove</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER - Notifications
  // ============================================
  const renderNotifications = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Notification Preferences</h3>
        <p>Choose what notifications you want to receive</p>

        <div className={styles.notificationList}>
          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Order Updates</span>
              <span className={styles.notificationDesc}>
                Get notified when orders are placed, shipped, or delivered
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.orderUpdates ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("orderUpdates")}
            >
              {notifications.orderUpdates ? <FiCheck size={14} /> : null}
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Payment Received</span>
              <span className={styles.notificationDesc}>
                Get notified when you receive a payment from a customer
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.paymentReceived ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("paymentReceived")}
            >
              {notifications.paymentReceived ? <FiCheck size={14} /> : null}
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Payout Completed</span>
              <span className={styles.notificationDesc}>
                Get notified when your payout is processed
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.payoutCompleted ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("payoutCompleted")}
            >
              {notifications.payoutCompleted ? <FiCheck size={14} /> : null}
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>New Reviews</span>
              <span className={styles.notificationDesc}>
                Get notified when customers leave reviews on your products
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.newReviews ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("newReviews")}
            >
              {notifications.newReviews ? <FiCheck size={14} /> : null}
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Marketing Emails</span>
              <span className={styles.notificationDesc}>
                Receive promotional emails and updates about new features
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.marketingEmails ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("marketingEmails")}
            >
              {notifications.marketingEmails ? <FiCheck size={14} /> : null}
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Product Alerts</span>
              <span className={styles.notificationDesc}>
                Get notified about product performance and recommendations
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.productAlerts ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("productAlerts")}
            >
              {notifications.productAlerts ? <FiCheck size={14} /> : null}
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Inventory Alerts</span>
              <span className={styles.notificationDesc}>
                Get notified when product inventory is running low
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.inventoryLow ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("inventoryLow")}
            >
              {notifications.inventoryLow ? <FiCheck size={14} /> : null}
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>System Updates</span>
              <span className={styles.notificationDesc}>
                Receive updates about system maintenance and new features
              </span>
            </div>
            <button
              className={`${styles.toggleSmall} ${notifications.systemUpdates ? styles.active : ""}`}
              onClick={() => handleNotificationToggle("systemUpdates")}
            >
              {notifications.systemUpdates ? <FiCheck size={14} /> : null}
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.saveBtn}
            onClick={() => handleSave("Notifications", notifications)}
            disabled={saving}
          >
            <FiSave size={16} />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER - Payments
  // ============================================
  const renderPayments = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Payment Settings</h3>
        <p>Configure your payment and payout preferences</p>

        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={payments.bankName}
              onChange={handlePaymentChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={payments.accountNumber}
              onChange={handlePaymentChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Account Holder Name</label>
            <input
              type="text"
              name="accountHolder"
              value={payments.accountHolder}
              onChange={handlePaymentChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={payments.ifscCode}
              onChange={handlePaymentChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={payments.upiId}
              onChange={handlePaymentChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>PAN Number</label>
            <input
              type="text"
              name="panNumber"
              value={payments.panNumber}
              onChange={handlePaymentChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>GSTIN</label>
            <input
              type="text"
              name="taxId"
              value={payments.taxId}
              onChange={handlePaymentChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Payout Frequency</label>
            <select
              name="payoutFrequency"
              value={payments.payoutFrequency}
              onChange={handlePaymentChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Minimum Payout (₹)</label>
            <input
              type="text"
              name="minimumPayout"
              value={payments.minimumPayout}
              onChange={handlePaymentChange}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.saveBtn}
            onClick={() => handleSave("Payment", payments)}
            disabled={saving}
          >
            <FiSave size={16} />
            {saving ? "Saving..." : "Save Payment Settings"}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER - Store
  // ============================================
  const renderStore = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3>Store Settings</h3>
        <p>Manage your store information and preferences</p>

        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label>Store Name</label>
            <input
              type="text"
              name="storeName"
              value={profile.storeName}
              onChange={handleProfileChange}
            />
          </div>
          <div className={styles.formGroupFull}>
            <label>Store URL</label>
            <input
              type="text"
              name="storeUrl"
              value={profile.storeUrl}
              onChange={handleProfileChange}
            />
            <span className={styles.hint}>aureviancollections.in/{profile.storeUrl}</span>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.saveBtn}
            onClick={() => handleSave("Store", profile)}
            disabled={saving}
          >
            <FiSave size={16} />
            {saving ? "Saving..." : "Save Store Settings"}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Account Actions</h3>
        <div className={styles.dangerZone}>
          <div className={styles.dangerItem}>
            <div>
              <span className={styles.dangerLabel}>Logout from all devices</span>
              <span className={styles.dangerDesc}>
                This will log you out from all active sessions
              </span>
            </div>
            <button className={styles.dangerBtn}>Logout All</button>
          </div>
          <div className={styles.dangerItem}>
            <div>
              <span className={styles.dangerLabel}>Delete Account</span>
              <span className={styles.dangerDesc}>
                Permanently delete your account and all associated data
              </span>
            </div>
            <button className={styles.dangerBtnDelete}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Settings</h1>
          <span className={styles.subtitle}>Manage your account preferences</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? styles.spinning : ""} size={16} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
};

export default Settings;