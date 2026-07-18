// src/Pages/SuperAdmin/SuperAdminDashboard/components/RecentActivities.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiClock,
  FiActivity,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiStar,
  FiRefreshCw,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiClock as FiClockIcon,
  FiTrendingUp,
  FiUsers
} from 'react-icons/fi';
import styles from './RecentActivities.module.css';

const RecentActivities = ({ activities: externalActivities, title = 'Recent Activities' }) => {
  const dispatch = useDispatch();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem('superAdminToken');

  // Activity type icons and colors
  const activityTypes = {
    seller_registered: { 
      icon: <FiUser />, 
      label: 'New Seller Registered',
      color: '#667eea',
      bgColor: '#eef2ff'
    },
    seller_approved: { 
      icon: <FiUserCheck />, 
      label: 'Seller Approved',
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    seller_rejected: { 
      icon: <FiUserX />, 
      label: 'Seller Rejected',
      color: '#ef4444',
      bgColor: '#fef2f2'
    },
    seller_suspended: { 
      icon: <FiAlertCircle />, 
      label: 'Seller Suspended',
      color: '#8b5cf6',
      bgColor: '#f5f3ff'
    },
    seller_unsuspended: { 
      icon: <FiCheckCircle />, 
      label: 'Seller Unsuspended',
      color: '#06b6d4',
      bgColor: '#ecfeff'
    },
    order_placed: { 
      icon: <FiShoppingBag />, 
      label: 'New Order Placed',
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    order_delivered: { 
      icon: <FiCheckCircle />, 
      label: 'Order Delivered',
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    product_added: { 
      icon: <FiPackage />, 
      label: 'New Product Added',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    review_received: { 
      icon: <FiStar />, 
      label: 'New Review Received',
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    payment_received: { 
      icon: <FiDollarSign />, 
      label: 'Payment Received',
      color: '#10b981',
      bgColor: '#ecfdf5'
    }
  };

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      setLoading(true);
      // You can create a dedicated endpoint for activities
      // For now, we'll fetch recent sellers and orders
      const [sellersRes, statsRes] = await Promise.all([
        axios.get('/api/super-admin/sellers?page=1&limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/super-admin/sellers/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const activitiesData = [];
      
      // Generate activities from sellers
      if (sellersRes.data.success) {
        const sellers = sellersRes.data.data;
        sellers.forEach(seller => {
          const statusMap = {
            'pending': { type: 'seller_registered', label: 'New seller registration', status: 'pending' },
            'approved': { type: 'seller_approved', label: 'Seller approved', status: 'approved' },
            'rejected': { type: 'seller_rejected', label: 'Seller rejected', status: 'rejected' },
            'suspended': { type: 'seller_suspended', label: 'Seller suspended', status: 'suspended' },
          };
          
          const activity = statusMap[seller.status] || statusMap.pending;
          
          activitiesData.push({
            id: seller._id,
            type: activity.type,
            title: `${seller.fullName || seller.firstName} ${seller.lastName || ''}`,
            description: `${seller.storeInfo?.storeName || 'Store'} • ${seller.email}`,
            timestamp: seller.createdAt || seller.statusUpdatedAt || new Date().toISOString(),
            status: activity.status,
            data: seller,
            metadata: {
              storeName: seller.storeInfo?.storeName,
              email: seller.email,
              phone: seller.phone,
              categories: seller.productCategories?.join(', ')
            }
          });
        });
      }

      // Add some mock order activities (replace with real data when order system is ready)
      const mockOrders = [
        {
          id: 'ord_1',
          type: 'order_placed',
          title: 'Order #ORD-2024-001',
          description: 'Priya Sharma • $2,999.99',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          metadata: { total: 2999.99, items: 3 }
        },
        {
          id: 'ord_2',
          type: 'order_delivered',
          title: 'Order #ORD-2024-002',
          description: 'Amit Patel • $4,999.50',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'delivered',
          metadata: { total: 4999.50, items: 2 }
        }
      ];

      // Add mock product activities
      const mockProducts = [
        {
          id: 'prod_1',
          type: 'product_added',
          title: 'Gold Necklace',
          description: 'Added by Priya\'s Jewellery Store',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          metadata: { price: 599.99, category: 'Necklaces' }
        }
      ];

      activitiesData.push(...mockOrders, ...mockProducts);

      // Sort by timestamp (newest first)
      activitiesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(date).toLocaleDateString();
  };

  const getActivityType = (type) => {
    return activityTypes[type] || { 
      icon: <FiActivity />, 
      label: 'Activity',
      color: '#6b7280',
      bgColor: '#f3f4f6'
    };
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      suspended: 'Suspended',
      delivered: 'Delivered',
      processing: 'Processing',
      shipped: 'Shipped',
      active: 'Active',
      inactive: 'Inactive'
    };
    return labels[status] || status;
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  const activityTypesList = [
    { value: 'all', label: 'All Activities' },
    ...Object.entries(activityTypes).map(([key, value]) => ({
      value: key,
      label: value.label
    }))
  ];

  if (loading) {
    return (
      <div className={styles.recentActivities}>
        <div className={styles.loadingContainer}>
          <FiRefreshCw className={styles.spinner} />
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recentActivities}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>
            <FiActivity className={styles.icon} />
            {title}
          </h3>
          <span className={styles.count}>{activities.length} activities</span>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.refreshBtn}
            onClick={fetchActivities}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spinning : ''} />
          </button>
          <select 
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {activityTypesList.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className={styles.emptyState}>
          <FiClock className={styles.emptyIcon} />
          <p>No activities found</p>
        </div>
      ) : (
        <div className={styles.activitiesList}>
          {filteredActivities.map((activity) => {
            const type = getActivityType(activity.type);
            const isExpanded = expandedId === activity.id;
            
            return (
              <div 
                key={activity.id} 
                className={`${styles.activityItem} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : activity.id)}
              >
                <div 
                  className={styles.activityIcon}
                  style={{ 
                    backgroundColor: type.bgColor, 
                    color: type.color 
                  }}
                >
                  {type.icon}
                </div>
                
                <div className={styles.activityContent}>
                  <div className={styles.activityHeader}>
                    <div className={styles.activityInfo}>
                      <span className={styles.activityType}>{type.label}</span>
                      <span className={styles.activityTime}>
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    {activity.status && (
                      <span className={`${styles.activityStatus} ${styles[activity.status]}`}>
                        {getStatusLabel(activity.status)}
                      </span>
                    )}
                  </div>
                  
                  <p className={styles.activityTitle}>{activity.title}</p>
                  <p className={styles.activityDescription}>{activity.description}</p>
                  
                  {/* Expanded Details */}
                  {isExpanded && activity.metadata && (
                    <div className={styles.expandedDetails}>
                      <div className={styles.metadataGrid}>
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className={styles.metadataItem}>
                            <span className={styles.metadataKey}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                            <span className={styles.metadataValue}>
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                      {activity.data && (
                        <div className={styles.viewDetailsBtn}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle view details action
                              console.log('View details for:', activity.data);
                            }}
                          >
                            View Full Details <FiChevronRight />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!isExpanded && activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className={styles.activityPreview}>
                      <FiChevronRight className={styles.previewIcon} />
                      <span>Click to view details</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;