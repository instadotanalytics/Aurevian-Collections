// src/Pages/SuperAdmin/SuperAdminDashboard/components/SellerDetails.jsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiLoader,
  FiEdit2,
  FiSave,
  FiTrash2,
  FiArrowLeft,
  FiDollarSign,
  FiPackage,
  FiStar,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiExternalLink,
  FiCopy
} from 'react-icons/fi';
import styles from './SellerDetails.module.css';

const SellerDetails = ({ seller, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [reason, setReason] = useState('');
  const [suspendedUntil, setSuspendedUntil] = useState('');

  const token = localStorage.getItem('superAdminToken');

  if (!seller) {
    return (
      <div className={styles.errorContainer}>
        <FiAlertCircle className={styles.errorIcon} />
        <h3>Seller not found</h3>
        <button onClick={onClose} className={styles.closeBtn}>Go Back</button>
      </div>
    );
  }

  const handleStatusChange = async (status, reasonText = '') => {
    setLoading(true);
    try {
      let endpoint = '';
      let data = {};

      switch(status) {
        case 'approved':
          endpoint = `/api/super-admin/sellers/${seller._id}/approve`;
          break;
        case 'rejected':
          endpoint = `/api/super-admin/sellers/${seller._id}/reject`;
          data = { reason: reasonText || 'Application rejected' };
          break;
        case 'suspended':
          endpoint = `/api/super-admin/sellers/${seller._id}/suspend`;
          data = { 
            reason: reasonText || 'Terms violation',
            suspendedUntil: suspendedUntil || null
          };
          break;
        case 'unsuspend':
          endpoint = `/api/super-admin/sellers/${seller._id}/unsuspend`;
          break;
        default:
          return;
      }

      const response = await axios({
        method: 'put',
        url: endpoint,
        data: data,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Seller ${status} successfully`);
        setShowRejectModal(false);
        setShowSuspendModal(false);
        setReason('');
        setSuspendedUntil('');
        // Refresh the seller data
        onClose();
        // Callback to refresh the list
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} seller`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedData({
      firstName: seller.firstName || '',
      lastName: seller.lastName || '',
      phone: seller.phone || '',
      businessDescription: seller.businessDescription || '',
      storeName: seller.storeInfo?.storeName || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/super-admin/sellers/${seller._id}/update`,
        editedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Seller updated successfully');
        setIsEditing(false);
        onClose();
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update seller');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', className: styles.pending },
      approved: { label: 'Approved', className: styles.approved },
      rejected: { label: 'Rejected', className: styles.rejected },
      suspended: { label: 'Suspended', className: styles.suspended },
      under_review: { label: 'Under Review', className: styles.underReview },
      deleted: { label: 'Deleted', className: styles.deleted },
    };
    return badges[status] || { label: status, className: styles.pending };
  };

  const getKYCStatus = (status) => {
    const statuses = {
      not_submitted: { label: 'Not Submitted', className: styles.kycPending },
      pending: { label: 'Pending', className: styles.kycPending },
      submitted: { label: 'Submitted', className: styles.kycSubmitted },
      under_review: { label: 'Under Review', className: styles.kycUnderReview },
      verified: { label: 'Verified', className: styles.kycVerified },
      rejected: { label: 'Rejected', className: styles.kycRejected },
    };
    return statuses[status] || { label: status, className: styles.kycPending };
  };

  const renderStatusActions = () => {
    if (seller.status === 'pending') {
      return (
        <div className={styles.statusActions}>
          <button
            className={`${styles.actionBtn} ${styles.approveBtn}`}
            onClick={() => handleStatusChange('approved')}
            disabled={loading}
          >
            {loading ? <FiLoader className={styles.spinner} /> : <FiCheckCircle />}
            Approve
          </button>
          <button
            className={`${styles.actionBtn} ${styles.rejectBtn}`}
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
          >
            <FiXCircle /> Reject
          </button>
        </div>
      );
    }

    if (seller.status === 'approved') {
      return (
        <div className={styles.statusActions}>
          <button
            className={`${styles.actionBtn} ${styles.suspendBtn}`}
            onClick={() => setShowSuspendModal(true)}
            disabled={loading}
          >
            <FiAlertCircle /> Suspend
          </button>
        </div>
      );
    }

    if (seller.status === 'suspended') {
      return (
        <div className={styles.statusActions}>
          <button
            className={`${styles.actionBtn} ${styles.unsuspendBtn}`}
            onClick={() => handleStatusChange('unsuspend')}
            disabled={loading}
          >
            <FiCheckCircle /> Unsuspend
          </button>
        </div>
      );
    }

    return null;
  };

  const renderRejectModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Reject Seller</h3>
          <button onClick={() => setShowRejectModal(false)} className={styles.modalClose}>
            <FiX />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>Please provide a reason for rejecting this seller:</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className={styles.modalTextarea}
            rows={4}
          />
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.modalCancel}
            onClick={() => setShowRejectModal(false)}
          >
            Cancel
          </button>
          <button
            className={`${styles.modalConfirm} ${styles.rejectBtn}`}
            onClick={() => handleStatusChange('rejected', reason)}
            disabled={!reason || loading}
          >
            {loading ? <FiLoader className={styles.spinner} /> : 'Reject Seller'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuspendModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowSuspendModal(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Suspend Seller</h3>
          <button onClick={() => setShowSuspendModal(false)} className={styles.modalClose}>
            <FiX />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>Please provide a reason for suspending this seller:</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter suspension reason..."
            className={styles.modalTextarea}
            rows={4}
          />
          <div className={styles.modalField}>
            <label>Suspended Until (Optional)</label>
            <input
              type="date"
              value={suspendedUntil}
              onChange={(e) => setSuspendedUntil(e.target.value)}
              className={styles.modalInput}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.modalCancel}
            onClick={() => setShowSuspendModal(false)}
          >
            Cancel
          </button>
          <button
            className={`${styles.modalConfirm} ${styles.suspendBtn}`}
            onClick={() => handleStatusChange('suspended', reason)}
            disabled={!reason || loading}
          >
            {loading ? <FiLoader className={styles.spinner} /> : 'Suspend Seller'}
          </button>
        </div>
      </div>
    </div>
  );

  const status = getStatusBadge(seller.status);
  const kycStatus = getKYCStatus(seller.verification?.kycStatus);

  return (
    <>
      <div className={styles.sellerDetails}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={onClose} className={styles.backBtn}>
              <FiArrowLeft /> Back
            </button>
            <h2 className={styles.title}>Seller Details</h2>
          </div>
          <div className={styles.headerRight}>
            <span className={`${styles.statusBadge} ${status.className}`}>
              {status.label}
            </span>
            <span className={`${styles.kycBadge} ${kycStatus.className}`}>
              KYC: {kycStatus.label}
            </span>
          </div>
        </div>

        {/* Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}>
            {seller.profileImage ? (
              <img src={seller.profileImage} alt={seller.fullName} />
            ) : (
              <span>{seller.fullName?.[0] || 'S'}</span>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{seller.fullName}</h3>
            <p className={styles.profileEmail}>
              <FiMail /> {seller.email}
            </p>
            <p className={styles.profilePhone}>
              <FiPhone /> {seller.phone}
            </p>
            <p className={styles.profileStore}>
              <FiShoppingBag /> {seller.storeInfo?.storeName || 'No Store Name'}
            </p>
          </div>
          <div className={styles.profileActions}>
            {renderStatusActions()}
            <button
              className={`${styles.actionBtn} ${styles.editBtn}`}
              onClick={handleEdit}
              disabled={loading}
            >
              <FiEdit2 /> Edit
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FiPackage className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{seller.stats?.totalProducts || 0}</span>
              <span className={styles.statLabel}>Total Products</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FiTrendingUp className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{seller.stats?.totalOrders || 0}</span>
              <span className={styles.statLabel}>Total Orders</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FiDollarSign className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>${seller.stats?.totalRevenue || 0}</span>
              <span className={styles.statLabel}>Total Revenue</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FiStar className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{seller.stats?.rating || 0} ★</span>
              <span className={styles.statLabel}>Rating</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className={styles.detailsGrid}>
          {/* Personal Information */}
          <div className={styles.detailsCard}>
            <h4 className={styles.detailsTitle}>
              <FiUser /> Personal Information
            </h4>
            <div className={styles.detailsContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>First Name</span>
                <span className={styles.detailValue}>
                  {isEditing ? (
                    <input
                      value={editedData.firstName}
                      onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    seller.firstName || 'N/A'
                  )}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Last Name</span>
                <span className={styles.detailValue}>
                  {isEditing ? (
                    <input
                      value={editedData.lastName}
                      onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    seller.lastName || 'N/A'
                  )}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>
                  <FiMail className={styles.detailIcon} /> {seller.email}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>
                  {isEditing ? (
                    <input
                      value={editedData.phone}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    <><FiPhone className={styles.detailIcon} /> {seller.phone || 'N/A'}</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Store Information */}
          <div className={styles.detailsCard}>
            <h4 className={styles.detailsTitle}>
              <FiShoppingBag /> Store Information
            </h4>
            <div className={styles.detailsContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Store Name</span>
                <span className={styles.detailValue}>
                  {isEditing ? (
                    <input
                      value={editedData.storeName}
                      onChange={(e) => setEditedData({ ...editedData, storeName: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    seller.storeInfo?.storeName || 'N/A'
                  )}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Brand Name</span>
                <span className={styles.detailValue}>{seller.brandName || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Categories</span>
                <span className={styles.detailValue}>
                  {seller.productCategories?.join(', ') || 'N/A'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Description</span>
                <span className={styles.detailValue}>
                  {isEditing ? (
                    <textarea
                      value={editedData.businessDescription}
                      onChange={(e) => setEditedData({ ...editedData, businessDescription: e.target.value })}
                      className={styles.editTextarea}
                      rows={3}
                    />
                  ) : (
                    seller.businessDescription || 'N/A'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className={styles.detailsCard}>
            <h4 className={styles.detailsTitle}>
              <FiMapPin /> Business Address
            </h4>
            <div className={styles.detailsContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Street</span>
                <span className={styles.detailValue}>{seller.businessAddress?.street || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>City</span>
                <span className={styles.detailValue}>{seller.businessAddress?.city || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>State</span>
                <span className={styles.detailValue}>{seller.businessAddress?.state || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Pincode</span>
                <span className={styles.detailValue}>{seller.businessAddress?.pincode || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Country</span>
                <span className={styles.detailValue}>{seller.businessAddress?.country || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {seller.bankDetails && (seller.bankDetails.accountHolderName || seller.bankDetails.bankName) && (
            <div className={styles.detailsCard}>
              <h4 className={styles.detailsTitle}>
                <FiDollarSign /> Bank Details
              </h4>
              <div className={styles.detailsContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Account Holder</span>
                  <span className={styles.detailValue}>{seller.bankDetails?.accountHolderName || 'N/A'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Bank Name</span>
                  <span className={styles.detailValue}>{seller.bankDetails?.bankName || 'N/A'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Account Number</span>
                  <span className={styles.detailValue}>{seller.bankDetails?.accountNumber || 'N/A'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>IFSC Code</span>
                  <span className={styles.detailValue}>{seller.bankDetails?.ifscCode || 'N/A'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>UPI ID</span>
                  <span className={styles.detailValue}>{seller.bankDetails?.upiId || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {seller.documents && Object.values(seller.documents).some(doc => doc) && (
            <div className={styles.detailsCard}>
              <h4 className={styles.detailsTitle}>
                <FiCheckCircle /> Documents
              </h4>
              <div className={styles.detailsContent}>
                {seller.documents.gstNumber && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>GST Number</span>
                    <span className={styles.detailValue}>{seller.documents.gstNumber}</span>
                  </div>
                )}
                {seller.documents.panNumber && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>PAN Number</span>
                    <span className={styles.detailValue}>{seller.documents.panNumber}</span>
                  </div>
                )}
                {seller.documents.aadhaarNumber && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Aadhaar Number</span>
                    <span className={styles.detailValue}>{seller.documents.aadhaarNumber}</span>
                  </div>
                )}
                <div className={styles.documentLinks}>
                  {seller.documents.gstCertificate && (
                    <a href={seller.documents.gstCertificate} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink /> GST Certificate
                    </a>
                  )}
                  {seller.documents.panCard && (
                    <a href={seller.documents.panCard} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink /> PAN Card
                    </a>
                  )}
                  {seller.documents.aadhaarCard && (
                    <a href={seller.documents.aadhaarCard} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink /> Aadhaar Card
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className={styles.detailsCard}>
            <h4 className={styles.detailsTitle}>
              <FiClock /> Account Timeline
            </h4>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineLabel}>Registered</span>
                  <span className={styles.timelineDate}>
                    {new Date(seller.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {seller.approvedAt && (
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineDot} ${styles.approved}`} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>Approved</span>
                    <span className={styles.timelineDate}>
                      {new Date(seller.approvedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              {seller.rejectedAt && (
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineDot} ${styles.rejected}`} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>Rejected</span>
                    <span className={styles.timelineDate}>
                      {new Date(seller.rejectedAt).toLocaleString()}
                    </span>
                    {seller.rejectedReason && (
                      <p className={styles.timelineReason}>Reason: {seller.rejectedReason}</p>
                    )}
                  </div>
                </div>
              )}
              {seller.suspendedAt && (
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineDot} ${styles.suspended}`} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>Suspended</span>
                    <span className={styles.timelineDate}>
                      {new Date(seller.suspendedAt).toLocaleString()}
                    </span>
                    {seller.suspendedReason && (
                      <p className={styles.timelineReason}>Reason: {seller.suspendedReason}</p>
                    )}
                  </div>
                </div>
              )}
              {seller.statusUpdatedAt && (
                <div className={styles.timelineItem}>
                  <div className={`${styles.timelineDot} ${styles.updated}`} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>Status Updated</span>
                    <span className={styles.timelineDate}>
                      {new Date(seller.statusUpdatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className={styles.editActions}>
            <button
              className={styles.cancelEditBtn}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className={styles.saveEditBtn}
              onClick={handleSaveEdit}
              disabled={loading}
            >
              {loading ? <FiLoader className={styles.spinner} /> : <FiSave />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showRejectModal && renderRejectModal()}
      {showSuspendModal && renderSuspendModal()}
    </>
  );
};

export default SellerDetails;