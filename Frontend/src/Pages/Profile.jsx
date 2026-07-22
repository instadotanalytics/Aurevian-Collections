// src/Pages/Profile/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiEdit2,
  FiSave,
  FiX,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiShoppingBag,
  FiDollarSign,
  FiStar,
  FiCalendar,
  FiChevronRight,
  FiCamera,
  FiUpload,
  FiTrash2,
} from 'react-icons/fi';
import { logoutUser, fetchCurrentUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';
import Header from '../Layout/Header/Header';
import Footer from '../Layout/Footer/Footer';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        }
      });
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      // Update profile API call
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        dispatch(fetchCurrentUser());
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    const formDataObj = new FormData();
    formDataObj.append('profileImage', profileImage);
    
    try {
      const response = await fetch('/api/users/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formDataObj
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Profile image updated!');
        dispatch(fetchCurrentUser());
        setProfileImagePreview(null);
        setProfileImage(null);
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Please login to view your profile</p>
        <button onClick={() => navigate('/login')} className={styles.primaryBtn}>
          Go to Login
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiUser /> },
    { id: 'orders', label: 'Orders', icon: <FiPackage /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
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
                {user.avatar || profileImagePreview ? (
                  <img 
                    src={profileImagePreview || user.avatar} 
                    alt={user.fullName}
                    className={styles.avatar}
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
                      style={{ display: 'none' }}
                    />
                  </label>
                </button>
              </div>
              {profileImage && (
                <button 
                  className={styles.uploadConfirmBtn}
                  onClick={handleImageUpload}
                >
                  <FiCheck size={16} /> Save Photo
                </button>
              )}
              <div className={styles.userInfo}>
                <h1 className={styles.userName}>{user.fullName || `${user.firstName} ${user.lastName}`}</h1>
                <p className={styles.userEmail}>{user.email}</p>
                {user.phone && <p className={styles.userPhone}>{user.phone}</p>}
                <span className={styles.userBadge}>
                  {user.role === 'admin' ? 'Admin' : 'Customer'}
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
                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.contentArea}>
            {activeTab === 'overview' && (
              <OverviewTab 
                user={user} 
                formData={formData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleChange={handleChange}
                handleUpdateProfile={handleUpdateProfile}
                updateLoading={updateLoading}
              />
            )}
            
            {activeTab === 'orders' && (
              <OrdersTab user={user} />
            )}
            
            {activeTab === 'wishlist' && (
              <WishlistTab user={user} />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab user={user} />
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;