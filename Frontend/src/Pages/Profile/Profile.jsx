// src/Pages/Profile/Profile.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMapPin,
  FiPackage,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiCamera,
  FiCheck,
  FiGift,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { logoutUser } from "../../redux/slices/authSlice";
import {
  fetchProfile,
  uploadAvatar,
  clearProfile,
} from "../../redux/slices/profileSlice";
import styles from "./Profile.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

// Import tab components
import OverviewTab from "./tabs/OverviewTab";
import AddressTab from "./tabs/AddressTab";
import OrdersTab from "./tabs/OrdersTab";
import WishlistTab from "./tabs/WishlistTab";
import SettingsTab from "./tabs/SettingsTab";
import ReferralTab from "./tabs/ReferralTab";

// ── Static config, hoisted so it isn't rebuilt on every render ──
const TABS = [
  { id: "overview", label: "Overview", icon: <FiUser /> },
  { id: "address", label: "Address", icon: <FiMapPin /> },
  { id: "orders", label: "Orders", icon: <FiPackage /> },
  { id: "wishlist", label: "Wishlist", icon: <FiHeart /> },
  { id: "referrals", label: "Referrals", icon: <FiGift /> },
  { id: "settings", label: "Settings", icon: <FiSettings /> },
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ── Masking helpers (sensitive data protection) ──
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email || "";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0] || ""}•••@${domain}`;
  return `${user.slice(0, 2)}${"•".repeat(Math.min(user.length - 2, 6))}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const prefix = phone.slice(0, phone.length - digits.length); // e.g. "+91 "
  const last4 = digits.slice(-4);
  return `${prefix}${"•".repeat(digits.length - 4)}${last4}`;
};

// ── Skeleton loading screen (same theme, transparent bg, throttled) ──
const ProfileSkeleton = () => (
  <div className={styles.container}>
    <div className={`${styles.profileHeader} ${styles.skeletonHeader}`}>
      <div className={styles.avatarSection}>
        <div className={`${styles.skeletonBox} ${styles.skeletonAvatar}`} />
        <div className={styles.userInfo}>
          <div className={`${styles.skeletonBox} ${styles.skeletonName}`} />
          <div className={`${styles.skeletonBox} ${styles.skeletonLine}`} />
          <div className={`${styles.skeletonBox} ${styles.skeletonLineShort}`} />
        </div>
      </div>
      <div className={`${styles.skeletonBox} ${styles.skeletonLogout}`} />
    </div>

    <div className={styles.tabsContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`${styles.skeletonBox} ${styles.skeletonTab}`} />
      ))}
    </div>

    <div className={styles.skeletonContent}>
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.skeletonBox} ${styles.skeletonStatCard}`} />
        ))}
      </div>
      <div className={`${styles.skeletonBox} ${styles.skeletonPanel}`} />
    </div>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state) => state.auth,
  );
  const { profile, loading: profileLoading } = useSelector(
    (state) => state.profile,
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [showContact, setShowContact] = useState(false);

  // ── Throttled skeleton (avoids flicker on fast responses) ──
  const isLoading = authLoading || profileLoading;
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      timer = setTimeout(() => setShowSkeleton(false), 500);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // ── Fetch profile data on mount ──
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ── Revoke object URLs to prevent memory leaks (runs on change + unmount) ──
  useEffect(() => {
    return () => {
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
    };
  }, [profileImagePreview]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later

    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  }, []);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    dispatch(clearProfile());
    navigate("/login");
  }, [dispatch, navigate]);

  const handleImageUpload = useCallback(async () => {
    if (!profileImage) return;

    const formDataObj = new FormData();
    formDataObj.append("avatar", profileImage);

    try {
      await dispatch(uploadAvatar(formDataObj)).unwrap();
      setProfileImagePreview(null);
      setProfileImage(null);
      setAvatarKey(Date.now());
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to upload photo");
    }
  }, [dispatch, profileImage]);

  const initials = useMemo(() => {
    if (!profile) return "U";
    const name =
      profile.fullName ||
      `${profile.firstName || ""} ${profile.lastName || ""}`;
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  }, [profile]);

  const avatarSrc = useMemo(
    () =>
      profileImagePreview ||
      profile?.avatar?.url ||
      profile?.profileImage?.url ||
      null,
    [profileImagePreview, profile],
  );

  const maskedEmail = useMemo(
    () => (showContact ? profile?.email : maskEmail(profile?.email)),
    [profile?.email, showContact],
  );

  const maskedPhone = useMemo(
    () => (showContact ? profile?.phone : maskPhone(profile?.phone)),
    [profile?.phone, showContact],
  );

  const isAdmin = profile?.role === "super_admin" || profile?.role === "admin";

  const toggleContactVisibility = useCallback(() => {
    setShowContact((prev) => !prev);
  }, []);

  const goToSettings = useCallback(() => {
    setActiveTab("settings");
  }, []);

  if (isLoading || showSkeleton) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.profilePage}>
          <ProfileSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.container}>
          <p>Please login to view your profile</p>
          <button
            onClick={() => navigate("/login")}
            className={styles.primaryBtn}
          >
            Go to Login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.profilePage}>
        <div className={styles.container}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profile.fullName || "Profile"}
                    className={styles.avatar}
                    key={avatarKey}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>{initials}</div>
                )}
                <button
                  type="button"
                  className={styles.avatarUploadBtn}
                  aria-label="Change profile photo"
                  title="Change profile photo"
                >
                  <label htmlFor="avatar-upload">
                    <FiCamera size={16} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </button>
              </div>

              {profileImage && (
                <button
                  type="button"
                  className={styles.uploadConfirmBtn}
                  onClick={handleImageUpload}
                  disabled={profileLoading}
                >
                  <FiCheck size={16} /> Save Photo
                </button>
              )}

              <div className={styles.userInfo}>
                <h1 className={styles.userName}>
                  {profile.fullName ||
                    `${profile.firstName || ""} ${profile.lastName || ""}`}
                  <span className={styles.userBadge}>
                    {isAdmin ? "Admin" : "Customer"}
                  </span>
                </h1>

                {profile.email && (
                  <p className={styles.userEmail}>
                    <FiMail size={13} className={styles.infoIcon} />
                    {maskedEmail}
                  </p>
                )}

                {profile.phone && (
                  <p className={styles.userPhone}>
                    <FiPhone size={13} className={styles.infoIcon} />
                    {maskedPhone}
                  </p>
                )}

                {(profile.email || profile.phone) && (
                  <button
                    type="button"
                    className={styles.contactToggleBtn}
                    onClick={toggleContactVisibility}
                    aria-label={showContact ? "Hide contact details" : "Show contact details"}
                  >
                    {showContact ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                    {showContact ? "Hide details" : "Show details"}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                onClick={goToSettings}
                className={styles.editProfileBtn}
              >
                <FiEdit2 size={15} />
                Edit Profile
              </button>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.contentArea}>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "address" && <AddressTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "wishlist" && <WishlistTab />}
            {activeTab === "referrals" && <ReferralTab />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;