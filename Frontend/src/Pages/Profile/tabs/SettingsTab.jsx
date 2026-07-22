// src/Pages/Profile/tabs/SettingsTab.jsx

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiBell,
  FiMail,
  FiLock,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiUser,
  FiGlobe,
  FiDollarSign,
  FiShield,
  FiSmartphone,
  FiTrash2,
  FiAlertTriangle,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { updatePreferences } from "../../../redux/slices/profileSlice";
import styles from "../Profile.module.css";

const SettingsTab = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const [saving, setSaving] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Settings stored in profile.preferences
  const [settings, setSettings] = useState({
    language: profile?.preferences?.language || "en",
    currency: profile?.preferences?.currency || "USD",
    timezone: profile?.preferences?.timezone || "UTC+5:30",
    emailNotifications: profile?.preferences?.emailNotifications !== false,
    smsNotifications: profile?.preferences?.smsNotifications || false,
    pushNotifications: profile?.preferences?.pushNotifications || false,
    newsletter: profile?.preferences?.newsletter || false,
    marketingEmails: profile?.preferences?.marketingEmails || false,
    orderUpdates: profile?.preferences?.orderUpdates !== false,
    promotionalSms: profile?.preferences?.promotionalSms || false,
    twoFactorAuth: profile?.preferences?.twoFactorAuth || false,
    enableOTP: profile?.preferences?.enableOTP || false,
    sessionTimeout: profile?.preferences?.sessionTimeout || "30m",
    profileVisibility: profile?.preferences?.profileVisibility || "public",
    showEmail: profile?.preferences?.showEmail || false,
    showPhone: profile?.preferences?.showPhone || false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailData, setEmailData] = useState({
    newEmail: "",
    confirmEmail: "",
    password: "",
  });

  const [activeDevices, setActiveDevices] = useState([]);

  useEffect(() => {
    if (profile?.preferences) {
      setSettings((prev) => ({
        ...prev,
        ...profile.preferences,
      }));
    }

    // Mock active devices
    setActiveDevices([
      {
        device: "Chrome on Windows",
        ip: "192.168.1.1",
        lastActive: new Date(),
        current: true,
      },
      {
        device: "Safari on iPhone",
        ip: "192.168.1.2",
        lastActive: new Date(Date.now() - 86400000),
        current: false,
      },
    ]);
  }, [profile]);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await dispatch(updatePreferences(settings)).unwrap();
    } catch (error) {
      // Error handled in slice
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const changeEmail = async () => {
    if (emailData.newEmail !== emailData.confirmEmail) {
      toast.error("Emails do not match");
      return;
    }
    if (!emailData.password) {
      toast.error("Please enter your password to confirm");
      return;
    }

    try {
      const response = await fetch("/api/users/change-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(
          "Email changed successfully! Please verify your new email.",
        );
        setEmailData({ newEmail: "", confirmEmail: "", password: "" });
      } else {
        toast.error(data.message || "Failed to change email");
      }
    } catch (error) {
      toast.error("Failed to change email");
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const response = await fetch("/api/users/deactivate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Account deactivated successfully");
        setShowDeactivateModal(false);
        window.location.href = "/logout";
      } else {
        toast.error(data.message || "Failed to deactivate account");
      }
    } catch (error) {
      toast.error("Failed to deactivate account");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Account deleted successfully");
        setShowDeleteModal(false);
        window.location.href = "/logout";
      } else {
        toast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "zh", label: "Chinese" },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "INR", label: "INR (₹)" },
  ];

  const timezones = [
    { value: "UTC-12:00", label: "UTC-12:00" },
    { value: "UTC-11:00", label: "UTC-11:00" },
    { value: "UTC-10:00", label: "UTC-10:00" },
    { value: "UTC-09:00", label: "UTC-09:00" },
    { value: "UTC-08:00", label: "UTC-08:00" },
    { value: "UTC-07:00", label: "UTC-07:00" },
    { value: "UTC-06:00", label: "UTC-06:00" },
    { value: "UTC-05:00", label: "UTC-05:00" },
    { value: "UTC-04:00", label: "UTC-04:00" },
    { value: "UTC-03:00", label: "UTC-03:00" },
    { value: "UTC-02:00", label: "UTC-02:00" },
    { value: "UTC-01:00", label: "UTC-01:00" },
    { value: "UTC+00:00", label: "UTC+00:00" },
    { value: "UTC+01:00", label: "UTC+01:00" },
    { value: "UTC+02:00", label: "UTC+02:00" },
    { value: "UTC+03:00", label: "UTC+03:00" },
    { value: "UTC+04:00", label: "UTC+04:00" },
    { value: "UTC+05:00", label: "UTC+05:00" },
    { value: "UTC+05:30", label: "UTC+05:30" },
    { value: "UTC+06:00", label: "UTC+06:00" },
    { value: "UTC+07:00", label: "UTC+07:00" },
    { value: "UTC+08:00", label: "UTC+08:00" },
    { value: "UTC+09:00", label: "UTC+09:00" },
    { value: "UTC+10:00", label: "UTC+10:00" },
    { value: "UTC+11:00", label: "UTC+11:00" },
    { value: "UTC+12:00", label: "UTC+12:00" },
  ];

  const profileVisibilities = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "friends", label: "Friends Only" },
  ];

  return (
    <div className={styles.settingsTab}>
      {/* Personal Settings */}
      <div className={styles.settingsCard}>
        <h3>
          <FiUser size={18} /> Personal Settings
        </h3>
        <div className={styles.settingsGrid}>
          <div className={styles.settingGroup}>
            <label>Language</label>
            <select
              name="language"
              value={settings.language}
              onChange={handleChange}
              className={styles.editSelect}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.settingGroup}>
            <label>Currency</label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className={styles.editSelect}
            >
              {currencies.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.settingGroup}>
            <label>Timezone</label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className={styles.editSelect}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className={styles.settingsCard}>
        <h3>
          <FiBell size={18} /> Notification Preferences
        </h3>
        <div className={styles.settingsList}>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Email Notifications</span>
            </div>
            <button
              onClick={() => handleToggle("emailNotifications")}
              className={styles.toggleBtn}
            >
              {settings.emailNotifications ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiSmartphone />
              <span>SMS Notifications</span>
            </div>
            <button
              onClick={() => handleToggle("smsNotifications")}
              className={styles.toggleBtn}
            >
              {settings.smsNotifications ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiBell />
              <span>Push Notifications</span>
            </div>
            <button
              onClick={() => handleToggle("pushNotifications")}
              className={styles.toggleBtn}
            >
              {settings.pushNotifications ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Newsletter</span>
            </div>
            <button
              onClick={() => handleToggle("newsletter")}
              className={styles.toggleBtn}
            >
              {settings.newsletter ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Marketing Emails</span>
            </div>
            <button
              onClick={() => handleToggle("marketingEmails")}
              className={styles.toggleBtn}
            >
              {settings.marketingEmails ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Order Updates</span>
            </div>
            <button
              onClick={() => handleToggle("orderUpdates")}
              className={styles.toggleBtn}
            >
              {settings.orderUpdates ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiSmartphone />
              <span>Promotional SMS</span>
            </div>
            <button
              onClick={() => handleToggle("promotionalSms")}
              className={styles.toggleBtn}
            >
              {settings.promotionalSms ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={styles.saveSettingsBtn}
        >
          <FiSave size={16} />
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>

      {/* Security */}
      <div className={styles.settingsCard}>
        <h3>
          <FiShield size={18} /> Security
        </h3>

        <div className={styles.securitySection}>
          <h4>Change Password</h4>
          <div className={styles.passwordForm}>
            <div className={styles.formGroup}>
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className={styles.editInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 8 characters)"
                className={styles.editInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className={styles.editInput}
              />
            </div>
            <button
              onClick={changePassword}
              className={styles.changePasswordBtn}
            >
              <FiLock size={16} />
              Change Password
            </button>
          </div>
        </div>

        <div className={styles.securitySection}>
          <h4>Two-Factor Authentication</h4>
          <div className={styles.settingItem}>
            <div>
              <FiShield />
              <span>Enable Two-Factor Authentication</span>
              <p className={styles.settingDescription}>
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={() => handleToggle("twoFactorAuth")}
              className={styles.toggleBtn}
            >
              {settings.twoFactorAuth ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiSmartphone />
              <span>Enable OTP Verification</span>
              <p className={styles.settingDescription}>
                Receive OTP for sensitive actions
              </p>
            </div>
            <button
              onClick={() => handleToggle("enableOTP")}
              className={styles.toggleBtn}
            >
              {settings.enableOTP ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
        </div>

        <div className={styles.securitySection}>
          <h4>Active Devices</h4>
          <div className={styles.devicesList}>
            {activeDevices.map((device, index) => (
              <div key={index} className={styles.deviceItem}>
                <div className={styles.deviceInfo}>
                  <FiSmartphone size={18} />
                  <div>
                    <span className={styles.deviceName}>{device.device}</span>
                    <span className={styles.deviceIP}>IP: {device.ip}</span>
                    <span className={styles.deviceLastActive}>
                      Last active:{" "}
                      {new Date(device.lastActive).toLocaleString()}
                    </span>
                  </div>
                </div>
                {device.current ? (
                  <span className={styles.currentDevice}>Current Device</span>
                ) : (
                  <button className={styles.revokeDeviceBtn}>
                    <FiLogOut size={14} /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className={styles.settingsCard}>
        <h3>
          <FiLock size={18} /> Privacy
        </h3>
        <div className={styles.settingsList}>
          <div className={styles.settingItem}>
            <div>
              <span>Profile Visibility</span>
              <p className={styles.settingDescription}>
                Choose who can see your profile
              </p>
            </div>
            <select
              name="profileVisibility"
              value={settings.profileVisibility}
              onChange={handleChange}
              className={styles.editSelect}
            >
              {profileVisibilities.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.settingItem}>
            <div>
              <span>Show Email on Profile</span>
            </div>
            <button
              onClick={() => handleToggle("showEmail")}
              className={styles.toggleBtn}
            >
              {settings.showEmail ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <span>Show Phone on Profile</span>
            </div>
            <button
              onClick={() => handleToggle("showPhone")}
              className={styles.toggleBtn}
            >
              {settings.showPhone ? (
                <FiToggleRight size={24} />
              ) : (
                <FiToggleLeft size={24} />
              )}
            </button>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={styles.saveSettingsBtn}
        >
          <FiSave size={16} />
          {saving ? "Saving..." : "Save Privacy Settings"}
        </button>
      </div>

      {/* Change Email */}
      <div className={styles.settingsCard}>
        <h3>
          <FiMail size={18} /> Change Email
        </h3>
        <div className={styles.passwordForm}>
          <div className={styles.formGroup}>
            <label>New Email</label>
            <input
              type="email"
              name="newEmail"
              value={emailData.newEmail}
              onChange={handleEmailChange}
              placeholder="Enter new email"
              className={styles.editInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm New Email</label>
            <input
              type="email"
              name="confirmEmail"
              value={emailData.confirmEmail}
              onChange={handleEmailChange}
              placeholder="Confirm new email"
              className={styles.editInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={emailData.password}
              onChange={handleEmailChange}
              placeholder="Enter your password to confirm"
              className={styles.editInput}
            />
          </div>
          <button onClick={changeEmail} className={styles.changeEmailBtn}>
            <FiMail size={16} />
            Change Email
          </button>
        </div>
      </div>

      {/* Account Management */}
      <div className={styles.settingsCard}>
        <h3>
          <FiAlertTriangle size={18} /> Account Management
        </h3>
        <div className={styles.accountActions}>
          <div className={styles.dangerAction}>
            <div>
              <h4>Deactivate Account</h4>
              <p>Temporarily deactivate your account</p>
            </div>
            <button
              onClick={() => setShowDeactivateModal(true)}
              className={styles.deactivateBtn}
            >
              Deactivate Account
            </button>
          </div>
          <div className={styles.dangerAction}>
            <div>
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className={styles.deleteAccountBtn}
            >
              <FiTrash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeactivateModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Deactivate Account</h3>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className={styles.closeModalBtn}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <FiAlertTriangle size={48} className={styles.warningIcon} />
              <p>Are you sure you want to deactivate your account?</p>
              <p className={styles.modalDescription}>
                Your profile will be hidden, and you won't be able to access
                your account. You can reactivate it anytime by logging back in.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                className={styles.deactivateConfirmBtn}
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Delete Account</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.closeModalBtn}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <FiAlertTriangle size={48} className={styles.dangerIcon} />
              <h4>Are you absolutely sure?</h4>
              <p className={styles.modalDescription}>
                This action cannot be undone. This will permanently delete your
                account, all your orders, and all associated data.
              </p>
              <p className={styles.modalWarning}>
                Please confirm that you want to permanently delete your account.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className={styles.deleteConfirmBtn}
              >
                <FiTrash2 size={16} />
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
