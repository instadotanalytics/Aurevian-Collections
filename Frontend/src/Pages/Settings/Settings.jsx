
// src/Pages/Settings/Settings.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiUser,
  FiLock,
  FiSliders,
  FiAlertTriangle,
  FiSave,
  FiShield,
} from "react-icons/fi";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import styles from "./Settings.module.css";
import * as userApi from "../../api/userApi.js";

const TABS = [
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "security", label: "Security", icon: FiLock },
  { id: "preferences", label: "Preferences", icon: FiSliders },
  { id: "danger", label: "Danger Zone", icon: FiAlertTriangle },
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";

/* Signature motif — a faceted diamond mark used as a divider / bullet
   throughout the page. Echoes the brand's product without illustrating
   an actual jewel. */
const Facet = ({ className = "" }) => (
  <svg
    className={className}
    width="10"
    height="10"
    viewBox="0 0 10 10"
    aria-hidden="true"
  >
    <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
  </svg>
);

const passwordStrength = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
};

const STRENGTH_LABEL = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    restockAlerts: true,
    marketingEmails: false,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteShake, setDeleteShake] = useState(false);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null;

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.fullName || !profile.email) {
      toast.error("Name and email are required");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile(profile);
      if (res.success) {
        toast.success("Profile updated");
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await userApi.changePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        toast.success("Password updated");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleTogglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const res = await userApi.updatePreferences(preferences);
      if (res.success) {
        toast.success("Preferences saved");
      } else {
        toast.error(res.message || "Failed to save preferences");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      setDeleteShake(true);
      setTimeout(() => setDeleteShake(false), 450);
      return;
    }
    setDeleting(true);
    try {
      const res = await userApi.deleteAccount();
      if (res.success) {
        toast.success("Account deleted");
        navigate("/");
      } else {
        toast.error(res.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  const strength = passwordStrength(passwords.newPassword);

  return (
    <>
      <Header />
      <div className={styles.settingsPage}>
        <div className={styles.eyebrow}>
          
          My Account
        </div>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>
          Manage your profile, security, and communication preferences.
        </p>

        <div className={styles.settingsGrid}>
          {/* Sidebar / tab nav */}
          <nav className={styles.sidebar} aria-label="Settings sections">
            <div className={styles.profileCard}>
              <div className={styles.sealWrap}>
                <div className={styles.sealRing} aria-hidden="true" />
                <div className={styles.avatarCircle}>
                  {getInitials(profile.fullName)}
                </div>
              </div>
              <div className={styles.profileMeta}>
                <p className={styles.profileName}>
                  {profile.fullName || "Your Name"}
                </p>
                <p className={styles.profileEmail}>{profile.email}</p>
                {memberSince && (
                  <p className={styles.memberBadge}>
                    <FiShield size={11} />
                    Member since {memberSince}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.tabList}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.tabButton} ${
                    activeTab === id ? styles.tabButtonActive : ""
                  } ${id === "danger" ? styles.tabButtonDanger : ""}`}
                  onClick={() => setActiveTab(id)}
                  aria-current={activeTab === id ? "true" : undefined}
                >
                  <span className={styles.tabIconWrap}>
                    <Icon size={15} />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content panel */}
          <div className={styles.contentPanel}>
            {activeTab === "profile" && (
              <form
                key="profile"
                className={styles.section}
                onSubmit={handleSaveProfile}
              >
                <div className={styles.sectionHeading}>
                  <h3>Profile Details</h3>
                
                </div>
                <p className={styles.sectionHint}>
                  This information appears on your orders and invoices.
                </p>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      placeholder="Full Name *"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Email Address *"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={savingProfile}
                >
                  <FiSave size={14} />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form
                key="security"
                className={styles.section}
                onSubmit={handleChangePassword}
              >
                <div className={styles.sectionHeading}>
                  <h3>Change Password</h3>
                  <Facet className={styles.headingFacet} />
                </div>
                <p className={styles.sectionHint}>
                  Use at least 8 characters, mixing letters and numbers.
                </p>

                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Current Password *"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="New Password *"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm New Password *"
                      required
                    />
                  </div>
                </div>

                {passwords.newPassword && (
                  <div className={styles.strengthMeter} aria-hidden="true">
                    <div className={styles.strengthTrack}>
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={`${styles.strengthBar} ${
                            i < strength ? styles.strengthBarFilled : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className={styles.strengthLabel}>
                      {STRENGTH_LABEL[strength]}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={savingPassword}
                >
                  <FiLock size={14} />
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {activeTab === "preferences" && (
              <div key="preferences" className={styles.section}>
                <div className={styles.sectionHeading}>
                  <h3>Communication Preferences</h3>
                  <Facet className={styles.headingFacet} />
                </div>
                <p className={styles.sectionHint}>
                  Choose what you'd like to hear from us.
                </p>

                <div className={styles.toggleList}>
                  <div className={styles.toggleRow}>
                    <div>
                      <p className={styles.toggleLabel}>Order Updates</p>
                      <p className={styles.toggleDesc}>
                        Shipping, delivery, and order status notifications.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.orderUpdates}
                      className={`${styles.toggleSwitch} ${
                        preferences.orderUpdates ? styles.toggleOn : ""
                      }`}
                      onClick={() => handleTogglePreference("orderUpdates")}
                    >
                      <span className={styles.toggleKnob} />
                    </button>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <p className={styles.toggleLabel}>Restock Alerts</p>
                      <p className={styles.toggleDesc}>
                        Know first when wishlist pieces return to stock.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.restockAlerts}
                      className={`${styles.toggleSwitch} ${
                        preferences.restockAlerts ? styles.toggleOn : ""
                      }`}
                      onClick={() => handleTogglePreference("restockAlerts")}
                    >
                      <span className={styles.toggleKnob} />
                    </button>
                  </div>

                  <div className={styles.toggleRow}>
                    <div>
                      <p className={styles.toggleLabel}>Marketing Emails</p>
                      <p className={styles.toggleDesc}>
                        New collections, offers, and editorial features.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.marketingEmails}
                      className={`${styles.toggleSwitch} ${
                        preferences.marketingEmails ? styles.toggleOn : ""
                      }`}
                      onClick={() => handleTogglePreference("marketingEmails")}
                    >
                      <span className={styles.toggleKnob} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.saveBtn}
                  disabled={savingPreferences}
                  onClick={handleSavePreferences}
                >
                  <FiSave size={14} />
                  {savingPreferences ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            )}

            {activeTab === "danger" && (
              <div
                key="danger"
                className={`${styles.section} ${styles.dangerSection}`}
              >
                <h3 className={styles.dangerHeading}>
                  <span className={styles.dangerIconWrap}>
                    <FiAlertTriangle size={16} />
                  </span>
                  Delete Account
                </h3>
                <p className={styles.sectionHint}>
                  This permanently removes your profile, saved addresses, and
                  order history. This action cannot be undone.
                </p>

                <div
                  className={`${styles.formGroup} ${
                    deleteShake ? styles.shake : ""
                  }`}
                >
                  <label>Type DELETE to confirm</label>
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className={styles.dangerInput}
                  />
                </div>

                <button
                  type="button"
                  className={styles.dangerBtn}
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "Deleting..." : "Permanently Delete Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Settings;