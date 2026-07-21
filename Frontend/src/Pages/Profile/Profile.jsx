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
  FiPlus,
  FiMinus,
  FiCheck,
  FiPlusCircle,
} from 'react-icons/fi';
import { logoutUser, fetchCurrentUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';
import Header from '../Layout/Header/Header';
import Footer from '../Layout/Footer/Footer';

// ============================================
// TAB COMPONENTS
// ============================================

// 1. OVERVIEW TAB
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
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>Profile Overview</h2>
        {!isEditing && (
          <button 
            className={styles.editBtn}
            onClick={() => setIsEditing(true)}
          >
            <FiEdit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.profileForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              disabled
            />
          </div>

          <div className={styles.formGroup}>
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              className={styles.saveBtn}
              onClick={handleUpdateProfile}
              disabled={updateLoading}
            >
              {updateLoading ? 'Saving...' : <><FiSave size={16} /> Save Changes</>}
            </button>
            <button 
              className={styles.cancelBtn}
              onClick={() => setIsEditing(false)}
            >
              <FiX size={16} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.profileInfo}>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Full Name</span>
              <p className={styles.infoValue}>{user.fullName || `${user.firstName} ${user.lastName}`}</p>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <p className={styles.infoValue}>{user.email}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <p className={styles.infoValue}>{user.phone || 'Not provided'}</p>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gender</span>
              <p className={styles.infoValue}>{user.gender || 'Not provided'}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date of Birth</span>
              <p className={styles.infoValue}>
                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member Since</span>
              <p className={styles.infoValue}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. ADDRESS TAB
const AddressTab = ({ user, fetchUser }) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user-profile/${user._id}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newAddress)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Address added successfully!');
        setShowAddressForm(false);
        setNewAddress({
          name: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          phone: '',
          isDefault: false
        });
        fetchUser();
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const response = await fetch(`/api/user-profile/${user._id}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Address deleted successfully!');
        fetchUser();
      } else {
        toast.error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const address = user.addresses.find(addr => addr._id === addressId);
      if (!address) return;

      const response = await fetch(`/api/user-profile/${user._id}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ ...address, isDefault: true })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Default address updated!');
        fetchUser();
      } else {
        toast.error(data.message || 'Failed to update default address');
      }
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>My Addresses</h2>
        <button 
          className={styles.editBtn}
          onClick={() => setShowAddressForm(!showAddressForm)}
        >
          <FiPlusCircle size={16} /> Add Address
        </button>
      </div>

      {showAddressForm && (
        <div className={styles.addressForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newAddress.name}
                onChange={handleAddressChange}
                placeholder="Full Name"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={newAddress.phone}
                onChange={handleAddressChange}
                placeholder="Phone Number"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Street</label>
            <input
              type="text"
              name="street"
              value={newAddress.street}
              onChange={handleAddressChange}
              placeholder="Street Address"
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>City</label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleAddressChange}
                placeholder="City"
              />
            </div>
            <div className={styles.formGroup}>
              <label>State</label>
              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleAddressChange}
                placeholder="State"
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={newAddress.pincode}
                onChange={handleAddressChange}
                placeholder="Pincode"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={newAddress.country}
                onChange={handleAddressChange}
                placeholder="Country"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>
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
              onClick={handleAddAddress}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Address'}
            </button>
            <button 
              className={styles.cancelBtn}
              onClick={() => setShowAddressForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {user.addresses && user.addresses.length > 0 ? (
        <div className={styles.addressList}>
          {user.addresses.map((address) => (
            <div key={address._id} className={styles.addressCard}>
              <div className={styles.addressDetails}>
                <div className={styles.addressHeader}>
                  <span className={styles.addressName}>{address.name}</span>
                  {address.isDefault && (
                    <span className={styles.addressDefault}>Default</span>
                  )}
                </div>
                <p className={styles.addressLine}>{address.street}</p>
                <p className={styles.addressLine}>
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className={styles.addressLine}>{address.country}</p>
                <p className={styles.addressPhone}>{address.phone}</p>
              </div>
              <div className={styles.addressActions}>
                {!address.isDefault && (
                  <button 
                    className={styles.addressDefaultBtn}
                    onClick={() => handleSetDefault(address._id)}
                  >
                    Set Default
                  </button>
                )}
                <button 
                  className={styles.addressDeleteBtn}
                  onClick={() => handleDeleteAddress(address._id)}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
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

// 3. ORDERS TAB
const OrdersTab = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/user-profile/${user._id}/orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user._id]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <FiCheckCircle />;
      case 'processing': return <FiClock />;
      case 'shipped': return <FiTruck />;
      case 'cancelled': return <FiAlertCircle />;
      default: return <FiPackage />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return styles.statusDelivered;
      case 'processing': return styles.statusProcessing;
      case 'shipped': return styles.statusShipped;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>My Orders</h2>
        <span className={styles.orderCount}>{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <FiShoppingBag size={48} />
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <button 
            className={styles.shopBtn}
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderInfo}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>Order #{order._id.slice(-6)}</span>
                  <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>
                <div className={styles.orderMeta}>
                  <span><FiCalendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span><FiPackage size={14} /> {order.items?.length || 0} items</span>
                  <span><FiDollarSign size={14} /> ₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
              <button className={styles.orderDetailsBtn}>
                View Details <FiChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. WISHLIST TAB
const WishlistTab = ({ user }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`/api/user-profile/${user._id}/wishlist`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setWishlist(data.wishlist);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user._id]);

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWishlist(wishlist.filter(item => item._id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCart = async (product) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Added to cart!');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>My Wishlist</h2>
        <span className={styles.orderCount}>{wishlist.length} items</span>
      </div>

      {wishlist.length === 0 ? (
        <div className={styles.emptyState}>
          <FiHeart size={48} />
          <h3>Your wishlist is empty</h3>
          <p>Save your favorite items here</p>
          <button 
            className={styles.shopBtn}
            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className={styles.wishlistGrid}>
          {wishlist.map((item) => (
            <div key={item._id} className={styles.wishlistItem}>
              <img 
                src={item.images?.[0] || '/placeholder.jpg'} 
                alt={item.name}
                className={styles.wishlistImage}
              />
              <div className={styles.wishlistInfo}>
                <h3 className={styles.wishlistName}>{item.name}</h3>
                <p className={styles.wishlistPrice}>₹{item.price?.toFixed(2)}</p>
                <div className={styles.wishlistActions}>
                  <button 
                    className={styles.wishlistCartBtn}
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className={styles.wishlistRemoveBtn}
                    onClick={() => removeFromWishlist(item._id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 5. SETTINGS TAB
const SettingsTab = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    twoFactorAuth: false,
    darkMode: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setSettings({
        emailNotifications: user.preferences.emailNotifications ?? true,
        orderUpdates: user.preferences.orderUpdates ?? true,
        promotionalEmails: user.preferences.promotionalEmails ?? false,
        twoFactorAuth: user.preferences.twoFactorAuth ?? false,
        darkMode: user.preferences.darkMode ?? false,
      });
    }
  }, [user]);

  const toggleSetting = async (key) => {
    setLoading(true);
    try {
      const updatedSettings = { ...settings, [key]: !settings[key] };
      const response = await fetch(`/api/user-profile/${user._id}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updatedSettings)
      });
      const data = await response.json();
      if (data.success) {
        setSettings(updatedSettings);
        toast.success('Settings updated!');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>Settings</h2>
      </div>

      <div className={styles.settingsList}>
        <div className={styles.settingsItem}>
          <div className={styles.settingsLabel}>
            <span>Email Notifications</span>
            <span>Receive email updates about your account</span>
          </div>
          <button 
            className={`${styles.settingsToggle} ${settings.emailNotifications ? styles.active : ''}`}
            onClick={() => toggleSetting('emailNotifications')}
            disabled={loading}
          />
        </div>

        <div className={styles.settingsItem}>
          <div className={styles.settingsLabel}>
            <span>Order Updates</span>
            <span>Get notified about order status changes</span>
          </div>
          <button 
            className={`${styles.settingsToggle} ${settings.orderUpdates ? styles.active : ''}`}
            onClick={() => toggleSetting('orderUpdates')}
            disabled={loading}
          />
        </div>

        <div className={styles.settingsItem}>
          <div className={styles.settingsLabel}>
            <span>Promotional Emails</span>
            <span>Receive offers and deals via email</span>
          </div>
          <button 
            className={`${styles.settingsToggle} ${settings.promotionalEmails ? styles.active : ''}`}
            onClick={() => toggleSetting('promotionalEmails')}
            disabled={loading}
          />
        </div>

        <div className={styles.settingsItem}>
          <div className={styles.settingsLabel}>
            <span>Two-Factor Authentication</span>
            <span>Add an extra layer of security to your account</span>
          </div>
          <button 
            className={`${styles.settingsToggle} ${settings.twoFactorAuth ? styles.active : ''}`}
            onClick={() => toggleSetting('twoFactorAuth')}
            disabled={loading}
          />
        </div>

        <div className={styles.settingsItem}>
          <div className={styles.settingsLabel}>
            <span>Dark Mode</span>
            <span>Switch to dark theme</span>
          </div>
          <button 
            className={`${styles.settingsToggle} ${settings.darkMode ? styles.active : ''}`}
            onClick={() => toggleSetting('darkMode')}
            disabled={loading}
          />
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Danger Zone</h3>
        <div className={styles.dangerItem}>
          <div>
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all data</p>
          </div>
          <button className={styles.deleteAccountBtn}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PROFILE COMPONENT
// ============================================

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
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const fetchUser = () => {
    dispatch(fetchCurrentUser());
  };

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
      setAvatarKey(Date.now());
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
      const response = await fetch(`/api/user-profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address
        })
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
      console.error('Update error:', error);
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
    formDataObj.append('avatar', profileImage);
    
    try {
      const response = await fetch(`/api/user-profile/${user._id}/avatar`, {
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
        setAvatarKey(Date.now());
      } else {
        toast.error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
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
    { id: 'address', label: 'Address', icon: <FiMapPin /> },
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
                  {user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : 'Customer'}
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
            
            {activeTab === 'address' && (
              <AddressTab user={user} fetchUser={fetchUser} />
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