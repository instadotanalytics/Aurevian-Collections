// src/Pages/Profile/tabs/OverviewTab.jsx

import React from 'react';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiGlobe,
  FiShoppingBag,
  FiDollarSign,
  FiStar,
} from 'react-icons/fi';
import styles from '../Profile.module.css';

const OverviewTab = ({ 
  user, 
  formData, 
  isEditing, 
  setIsEditing, 
  handleChange, 
  handleUpdateProfile,
  updateLoading 
}) => {
  return (
    <div className={styles.overviewTab}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <FiShoppingBag className={styles.statIcon} />
          <div>
            <p className={styles.statValue}>{user.totalOrders || 0}</p>
            <p className={styles.statLabel}>Total Orders</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiDollarSign className={styles.statIcon} />
          <div>
            <p className={styles.statValue}>${user.totalSpent || 0}</p>
            <p className={styles.statLabel}>Total Spent</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FiStar className={styles.statIcon} />
          <div>
            <p className={styles.statValue}>{user.rewardPoints || 0}</p>
            <p className={styles.statLabel}>Reward Points</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className={styles.infoCard}>
        <div className={styles.cardHeader}>
          <h3>Personal Information</h3>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
              <FiEdit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
              <FiX size={16} />
              Cancel
            </button>
          )}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Full Name</span>
            {isEditing ? (
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.editInput}
                placeholder="First Name"
              />
            ) : (
              <span className={styles.infoValue}>{user.fullName}</span>
            )}
            {isEditing && (
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.editInput}
                placeholder="Last Name"
              />
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>
              <FiMail className={styles.infoIcon} />
              {user.email}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phone</span>
            {isEditing ? (
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.editInput}
                placeholder="Phone Number"
              />
            ) : (
              <span className={styles.infoValue}>
                <FiPhone className={styles.infoIcon} />
                {user.phone || 'Not provided'}
              </span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Gender</span>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={styles.editSelect}
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <span className={styles.infoValue}>{user.gender || 'Not specified'}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date of Birth</span>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              <span className={styles.infoValue}>
                <FiCalendar className={styles.infoIcon} />
                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className={styles.addressSection}>
          <h4>Address</h4>
          {isEditing ? (
            <div className={styles.addressForm}>
              <input
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={styles.editInput}
                placeholder="Street Address"
              />
              <div className={styles.addressRow}>
                <input
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder="City"
                />
                <input
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder="State"
                />
              </div>
              <div className={styles.addressRow}>
                <input
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className={styles.editInput}
                  placeholder="Pincode"
                />
                <select
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className={styles.editSelect}
                >
                  <option value="India">India</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
            </div>
          ) : (
            <p className={styles.addressText}>
              {user.address?.street && (
                <>
                  {user.address.street}, {user.address.city}, {user.address.state} - {user.address.pincode}
                  <br />
                  {user.address.country}
                </>
              )}
              {!user.address?.street && 'No address added yet'}
            </p>
          )}
        </div>

        {isEditing && (
          <button
            onClick={handleUpdateProfile}
            disabled={updateLoading}
            className={styles.saveProfileBtn}
          >
            <FiSave size={16} />
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;