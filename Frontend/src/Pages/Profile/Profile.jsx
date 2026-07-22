// src/Pages/Profile/Profile.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMapPin,
  FiPackage,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiCamera,
  FiCheck,
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

  // Fetch profile data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearProfile());
    navigate("/login");
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    const formDataObj = new FormData();
    formDataObj.append("avatar", profileImage);

    try {
      await dispatch(uploadAvatar(formDataObj)).unwrap();
      setProfileImagePreview(null);
      setProfileImage(null);
      setAvatarKey(Date.now());
    } catch (error) {
      // Error handled in slice
    }
  };

  const getInitials = () => {
    if (!profile) return "U";
    const name =
      profile.fullName ||
      `${profile.firstName || ""} ${profile.lastName || ""}`;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = profile?.role === "super_admin" || profile?.role === "admin";
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <p>Please login to view your profile</p>
        <button
          onClick={() => navigate("/login")}
          className={styles.primaryBtn}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiUser /> },
    { id: "address", label: "Address", icon: <FiMapPin /> },
    { id: "orders", label: "Orders", icon: <FiPackage /> },
    { id: "wishlist", label: "Wishlist", icon: <FiHeart /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.profilePage}>
        <div className={styles.container}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                {profile.avatar?.url ||
                profile.profileImage?.url ||
                profileImagePreview ? (
                  <img
                    src={
                      profileImagePreview ||
                      profile.avatar?.url ||
                      profile.profileImage?.url
                    }
                    alt={profile.fullName}
                    className={styles.avatar}
                    key={avatarKey}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {getInitials()}
                  </div>
                )}
                <button className={styles.avatarUploadBtn}>
                  <label htmlFor="avatar-upload">
                    <FiCamera size={16} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </button>
              </div>
              {profileImage && (
                <button
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
                    `${profile.firstName} ${profile.lastName}`}
                </h1>
                <p className={styles.userEmail}>{profile.email}</p>
                {profile.phone && (
                  <p className={styles.userPhone}>{profile.phone}</p>
                )}
                <span className={styles.userBadge}>
                  {isAdmin ? "Admin" : "Customer"}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut size={18} />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab.id)}
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
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
