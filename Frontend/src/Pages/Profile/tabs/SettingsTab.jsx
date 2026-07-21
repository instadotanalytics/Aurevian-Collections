// src/Pages/Profile/tabs/SettingsTab.jsx

import React, { useState } from 'react';
import { FiBell, FiMail, FiLock, FiToggleLeft, FiToggleRight, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from '../Profile.module.css';

const SettingsTab = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: user?.preferences?.emailNotifications !== false,
    smsNotifications: user?.preferences?.smsNotifications || false,
    pushNotifications: user?.preferences?.pushNotifications || false,
    newsletter: user?.preferences?.newsletter || false,
    marketingEmails: user?.preferences?.marketingEmails || false,
    orderUpdates: user?.preferences?.orderUpdates !== false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ preferences: settings })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className={styles.settingsTab}>
      {/* Notification Preferences */}
      <div className={styles.settingsCard}>
        <h3>Notification Preferences</h3>
        <div className={styles.settingsList}>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Email Notifications</span>
            </div>
            <button onClick={() => handleToggle('emailNotifications')}>
              {settings.emailNotifications ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiBell />
              <span>SMS Notifications</span>
            </div>
            <button onClick={() => handleToggle('smsNotifications')}>
              {settings.smsNotifications ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiBell />
              <span>Push Notifications</span>
            </div>
            <button onClick={() => handleToggle('pushNotifications')}>
              {settings.pushNotifications ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Newsletter</span>
            </div>
            <button onClick={() => handleToggle('newsletter')}>
              {settings.newsletter ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Marketing Emails</span>
            </div>
            <button onClick={() => handleToggle('marketingEmails')}>
              {settings.marketingEmails ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>
          <div className={styles.settingItem}>
            <div>
              <FiMail />
              <span>Order Updates</span>
            </div>
            <button onClick={() => handleToggle('orderUpdates')}>
              {settings.orderUpdates ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>
        </div>
        <button onClick={saveSettings} disabled={saving} className={styles.saveSettingsBtn}>
          <FiSave size={16} />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Change Password */}
      <div className={styles.settingsCard}>
        <h3>Change Password</h3>
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
              placeholder="Enter new password"
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
          <button onClick={changePassword} className={styles.changePasswordBtn}>
            <FiLock size={16} />
            Change Password
          </button>
        </div>
      </div>

      {/* Account Management */}
      <div className={styles.settingsCard}>
        <h3>Account Management</h3>
        <div className={styles.accountActions}>
          <button className={styles.deactivateBtn}>
            Deactivate Account
          </button>
          <button className={styles.deleteAccountBtn}>
            Delete Account
          </button>
        </div>
        <p className={styles.accountNote}>
          Deactivating your account will hide your profile. Deleting your account is permanent.
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;