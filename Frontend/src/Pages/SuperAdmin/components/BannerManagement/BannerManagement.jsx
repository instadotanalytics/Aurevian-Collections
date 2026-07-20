// src/Pages/SuperAdmin/components/BannerManagement/BannerManagement.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  updateBannerOrder,
  clearBannerError
} from '../../../../redux/slices/bannerSlice';
import styles from './BannerManagement.module.css';
import toast from 'react-hot-toast';

const BannerManagement = () => {
  const dispatch = useDispatch();
  const { banners, isLoading, isUploading, error, pagination } = useSelector(
    (state) => state.banners
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    offer: '',
    subtext: '',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    isActive: true,
    isFeatured: false,
    startDate: '',
    endDate: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBanners();
  }, [pagination.page, searchTerm, filterStatus]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBannerError());
    }
  }, [error, dispatch]);

  const fetchBanners = () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    };
    if (searchTerm) params.search = searchTerm;
    if (filterStatus !== 'all') params.isActive = filterStatus === 'active';
    dispatch(fetchAllBanners(params));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key] instanceof File) {
        formDataToSend.append('image', formData[key]);
      } else if (key !== 'image') {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      if (editingBanner) {
        await dispatch(updateBanner({
          id: editingBanner._id,
          formData: formDataToSend
        })).unwrap();
        toast.success('Banner updated successfully!');
      } else {
        await dispatch(createBanner(formDataToSend)).unwrap();
        toast.success('Banner created successfully!');
      }
      handleCloseModal();
      fetchBanners();
    } catch (error) {
      toast.error(error || 'Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await dispatch(deleteBanner(id)).unwrap();
        toast.success('Banner deleted successfully!');
        fetchBanners();
      } catch (error) {
        toast.error(error || 'Failed to delete banner');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleBannerStatus(id)).unwrap();
      toast.success('Banner status updated!');
      fetchBanners();
    } catch (error) {
      toast.error(error || 'Failed to update banner status');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      offer: banner.offer || '',
      subtext: banner.subtext || '',
      buttonText: banner.buttonText || 'Shop Now',
      buttonLink: banner.buttonLink || '/shop',
      isActive: banner.isActive,
      isFeatured: banner.isFeatured || false,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      image: null
    });
    setPreviewImage(banner.image?.url || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      offer: '',
      subtext: '',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      isActive: true,
      isFeatured: false,
      startDate: '',
      endDate: '',
      image: null
    });
    setPreviewImage(null);
  };

  const handlePageChange = (newPage) => {
    dispatch(setBannerPage(newPage));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Banner Management</h1>
          <p className={styles.subtitle}>Manage your homepage banners</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => {
            setEditingBanner(null);
            setFormData({
              title: '',
              subtitle: '',
              offer: '',
              subtext: '',
              buttonText: 'Shop Now',
              buttonLink: '/shop',
              isActive: true,
              isFeatured: false,
              startDate: '',
              endDate: '',
              image: null
            });
            setPreviewImage(null);
            setIsModalOpen(true);
          }}
        >
          <span>+</span> Create Banner
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Banner Grid */}
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No banners found</p>
          <button className={styles.createButton} onClick={() => setIsModalOpen(true)}>
            Create your first banner
          </button>
        </div>
      ) : (
        <div className={styles.bannerGrid}>
          {banners.map((banner) => (
            <div key={banner._id} className={styles.bannerCard}>
              <div className={styles.bannerImage}>
                <img src={banner.image?.url} alt={banner.title} />
                <div className={styles.bannerStatus}>
                  <span className={`${styles.statusBadge} ${banner.isActive ? styles.active : styles.inactive}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {banner.isFeatured && (
                    <span className={styles.featuredBadge}>Featured</span>
                  )}
                </div>
              </div>
              <div className={styles.bannerContent}>
                <h3 className={styles.bannerTitle}>{banner.title}</h3>
                {banner.subtitle && (
                  <p className={styles.bannerSubtitle}>{banner.subtitle}</p>
                )}
                {banner.offer && (
                  <p className={styles.bannerOffer}>{banner.offer}</p>
                )}
                <div className={styles.bannerActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEdit(banner)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.toggleButton}`}
                    onClick={() => handleToggleStatus(banner._id)}
                  >
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDelete(banner._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter banner title"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Enter subtitle"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Offer Text</label>
                <input
                  type="text"
                  name="offer"
                  value={formData.offer}
                  onChange={handleInputChange}
                  placeholder="e.g., Flat 15% OFF"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Subtext</label>
                <input
                  type="text"
                  name="subtext"
                  value={formData.subtext}
                  onChange={handleInputChange}
                  placeholder="Additional description"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    placeholder="Shop Now"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Button Link</label>
                  <input
                    type="text"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleInputChange}
                    placeholder="/shop"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Banner Image</label>
                <div className={styles.imageUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    id="bannerImage"
                  />
                  <label htmlFor="bannerImage" className={styles.fileLabel}>
                    {previewImage ? 'Change Image' : 'Upload Image'}
                  </label>
                  {previewImage && (
                    <div className={styles.imagePreview}>
                      <img src={previewImage} alt="Preview" />
                    </div>
                  )}
                </div>
                {!previewImage && !editingBanner && (
                  <p className={styles.hint}>* Image is required for new banners</p>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    Featured
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isUploading}
                >
                  {isUploading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;