
// src/Pages/SuperAdmin/components/BlogManagement/BlogManagement.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  clearBlogError,
  clearCurrentBlog
} from '../../../../redux/slices/blogSlice';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiX,
  FiFileText,
  FiCalendar,
  FiImage,
  FiLoader,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import styles from './BlogManagement.module.css';

// Skeleton Loader — mirrors SellerRequests' row skeleton
const SkeletonLoader = ({ count = 8 }) => (
  <div className={styles.skeletonContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={styles.skeletonRow}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonTitle}>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLineShort}></div>
        </div>
        <div className={styles.skeletonCategory}></div>
        <div className={styles.skeletonStatus}></div>
        <div className={styles.skeletonViews}></div>
        <div className={styles.skeletonDate}></div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonIcon}></div>
          <div className={styles.skeletonIcon}></div>
          <div className={styles.skeletonIcon}></div>
        </div>
      </div>
    ))}
  </div>
);

const BlogManagement = ({ activeTab = 'blog-all' }) => {
  const dispatch = useDispatch();
  const { blogs, isLoading, isUploading, error, pagination, stats } = useSelector(
    (state) => state.blogs
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'jewellery',
    tags: '',
    status: 'draft',
    isFeatured: false,
    isTrending: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
    featuredImage: null,
    scheduledPublish: '',
  });

  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    'jewellery', 'diamonds', 'gold', 'bridal',
    'fashion', 'care', 'trends', 'culture', 'sustainability', 'other'
  ];

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus, selectedCategory, searchTerm, activeTab]);

  useEffect(() => {
    return () => {
      dispatch(clearBlogError());
      dispatch(clearCurrentBlog());
    };
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 'blog-drafts') {
      setFilterStatus('draft');
    } else if (activeTab === 'blog-published') {
      setFilterStatus('published');
    } else {
      setFilterStatus('all');
    }
  }, [activeTab]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBlogError());
    }
  }, [error, dispatch]);

  const fetchBlogs = () => {
    const params = { page: currentPage, limit: 10 };
    if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
    if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
    dispatch(fetchAllBlogsAdmin(params));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({ ...prev, seo: { ...prev.seo, [seoField]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'jewellery',
      tags: '',
      status: 'draft',
      isFeatured: false,
      isTrending: false,
      seo: { metaTitle: '', metaDescription: '', metaKeywords: '' },
      featuredImage: null,
      scheduledPublish: '',
    });
    setImagePreview(null);
    setEditingBlog(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast.error('Title is required');
    if (!formData.excerpt.trim()) return toast.error('Excerpt is required');
    if (!formData.content.trim()) return toast.error('Content is required');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      formDataToSend.append('tags', JSON.stringify(tagsArray));

      formDataToSend.append('status', formData.status);
      formDataToSend.append('isFeatured', formData.isFeatured);
      formDataToSend.append('isTrending', formData.isTrending);
      formDataToSend.append('seo', JSON.stringify(formData.seo));

      if (formData.scheduledPublish) {
        formDataToSend.append('scheduledPublish', formData.scheduledPublish);
      }
      if (formData.featuredImage) {
        formDataToSend.append('featuredImage', formData.featuredImage);
      }

      if (editingBlog) {
        await dispatch(updateBlog({ id: editingBlog._id, formData: formDataToSend })).unwrap();
        toast.success('Blog updated successfully!');
      } else {
        if (!formData.featuredImage) {
          toast.error('Featured image is required for new blog');
          return;
        }
        await dispatch(createBlog(formDataToSend)).unwrap();
        toast.success('Blog created successfully!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchBlogs();
    } catch (err) {
      toast.error(err || 'Failed to save blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || 'jewellery',
      tags: blog.tags?.join(', ') || '',
      status: blog.status || 'draft',
      isFeatured: blog.isFeatured || false,
      isTrending: blog.isTrending || false,
      seo: {
        metaTitle: blog.seo?.metaTitle || '',
        metaDescription: blog.seo?.metaDescription || '',
        metaKeywords: blog.seo?.metaKeywords || '',
      },
      featuredImage: null,
      scheduledPublish: blog.scheduledPublish ? blog.scheduledPublish.split('T')[0] : '',
    });
    setImagePreview(blog.featuredImage?.url || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await dispatch(deleteBlog(id)).unwrap();
        toast.success('Blog deleted successfully!');
        fetchBlogs();
      } catch (err) {
        toast.error(err || 'Failed to delete blog');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleRefresh = () => {
    fetchBlogs();
    toast.success('Refreshed!');
  };

  const getStatusBadge = (status) => {
    const map = {
      published: { label: 'Published', className: styles.statusApproved },
      draft: { label: 'Draft', className: styles.statusPending },
      archived: { label: 'Archived', className: styles.statusNeutral },
    };
    return map[status] || map.draft;
  };

  const getCategoryLabel = (category) => category.charAt(0).toUpperCase() + category.slice(1);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || selectedCategory !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiFileText size={60} className={styles.emptyIcon} />
      <h3>No blogs found</h3>
      <p>
        {hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first blog post to get started'}
      </p>
      {hasActiveFilters ? (
        <button className={styles.clearFiltersBtn} onClick={clearAllFilters}>
          <FiX size={18} />
          Clear All Filters
        </button>
      ) : (
        <button className={styles.createBtn} onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <FiPlus size={16} /> Create Blog
        </button>
      )}
    </div>
  );

  if (isLoading && !blogs) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  const showLoadingState = isLoading && (!blogs || blogs.length === 0);

  return (
    <div className={styles.container}>
      {/* Header — same shape as SellerRequests */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Blog Management</h1>
          <span className={styles.countPill}>{stats?.total ?? 0} blogs</span>
        </div>
        <div className={styles.headerRight}>
          {stats && (
            <div className={styles.statsBar}>
              <span className={styles.statsLabel}>
                <FiFileText size={14} />
                Overview:
              </span>
              <span className={styles.statsItem}>
                Published: <strong>{stats.published || 0}</strong>
              </span>
              <span className={styles.statsItem}>
                Drafts: <strong>{stats.draft || 0}</strong>
              </span>
              <span className={styles.statsItem}>
                Archived: <strong>{stats.archived || 0}</strong>
              </span>
            </div>
          )}
          <div className={styles.headerActions}>
            <button className={styles.refreshBtn} onClick={handleRefresh} title="Refresh">
              <FiRefreshCw size={16} />
            </button>
            <button className={styles.createBtn} onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <FiPlus size={16} /> Create Blog
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => { setCurrentPage(1); setSearchTerm(e.target.value); }}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => { setCurrentPage(1); setFilterStatus(e.target.value); }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => { setCurrentPage(1); setSelectedCategory(e.target.value); }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className={styles.clearFiltersBtn} onClick={clearAllFilters}>
              <FiX size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {showLoadingState ? (
        <div className={styles.tableContainer}>
          <SkeletonLoader count={8} />
        </div>
      ) : blogs && blogs.length > 0 ? (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.blogTable}>
              <thead>
                <tr>
                  <th className={styles.imageCell}>Image</th>
                  <th className={styles.titleCell}>Title</th>
                  <th className={styles.categoryCellCol}>Category</th>
                  <th className={styles.statusCellCol}>Status</th>
                  <th className={styles.viewsCellCol}>Views</th>
                  <th className={styles.dateCellCol}>Date</th>
                  <th className={styles.actionsCellCol}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => {
                  const status = getStatusBadge(blog.status);
                  return (
                    <tr key={blog._id} className={styles.tableRow}>
                      <td className={styles.imageCell} data-label="Image">
                        {blog.featuredImage?.url ? (
                          <img src={blog.featuredImage.url} alt={blog.title} />
                        ) : (
                          <div className={styles.noImage}>No Image</div>
                        )}
                      </td>

                      <td className={styles.titleCell} data-label="Title">
                        <div className={styles.titleText}>{blog.title}</div>
                        <div className={styles.excerptText}>
                          {blog.excerpt?.substring(0, 80)}...
                        </div>
                      </td>

                      <td className={styles.categoryCellCol} data-label="Category">
                        <span className={styles.categoryPill}>
                          {getCategoryLabel(blog.category)}
                        </span>
                      </td>

                      <td className={styles.statusCellCol} data-label="Status">
                        <span className={`${styles.statusBadge} ${status.className}`}>
                          <span className={styles.dot}></span>
                          {status.label}
                        </span>
                      </td>

                      <td className={styles.viewsCellCol} data-label="Views">
                        <div className={styles.viewsInfo}>
                          <FiEye size={12} /> {blog.views || 0}
                        </div>
                      </td>

                      <td className={styles.dateCellCol} data-label="Date">
                        <div className={styles.dateInfo}>
                          <FiCalendar size={12} />
                          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        </div>
                      </td>

                      <td className={styles.actionsCellCol} data-label="Actions">
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionIconBtn} ${styles.viewIconBtn}`}
                            onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                            title="View"
                          >
                            <FiEye size={14} />
                            <span className={styles.actionBtnLabel}>View</span>
                          </button>
                          <button
                            className={`${styles.actionIconBtn} ${styles.editIconBtn}`}
                            onClick={() => handleEdit(blog)}
                            title="Edit"
                          >
                            <FiEdit size={14} />
                            <span className={styles.actionBtnLabel}>Edit</span>
                          </button>
                          <button
                            className={`${styles.actionIconBtn} ${styles.deleteIconBtn}`}
                            onClick={() => handleDelete(blog._id)}
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                            <span className={styles.actionBtnLabel}>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination — same numbered pattern as SellerRequests */}
          {pagination && pagination.pages > 1 && (
            <>
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                >
                  <FiChevronLeft size={18} />
                </button>

                <div className={styles.paginationPages}>
                  {[...Array(pagination.pages)].map((_, i) => {
                    const p = i + 1;
                    const isActive = p === pagination.page;
                    const isNearCurrent = Math.abs(p - pagination.page) <= 2;
                    const isFirst = p === 1;
                    const isLast = p === pagination.pages;

                    if (isNearCurrent || isFirst || isLast) {
                      return (
                        <button
                          key={p}
                          className={`${styles.pageBtn} ${isActive ? styles.activePage : ''}`}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      );
                    }

                    if (
                      (p === pagination.page - 3 && pagination.page > 4) ||
                      (p === pagination.page + 3 && pagination.page < pagination.pages - 3)
                    ) {
                      return <span key={p} className={styles.pageDots}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page === pagination.pages}
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
              <div className={styles.paginationInfo}>
                Showing {((pagination.page - 1) * pagination.limit) + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
            </>
          )}
        </>
      ) : (
        renderEmptyState()
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Title <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog title..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Excerpt <span className={styles.required}>*</span></label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your blog..."
                  rows="2"
                  required
                />
                <span className={styles.hint}>Max 300 characters</span>
              </div>

              <div className={styles.formGroup}>
                <label>Content <span className={styles.required}>*</span></label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your blog content here..."
                  rows="8"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category <span className={styles.required}>*</span></label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="jewellery, gold, bridal"
                  />
                  <span className={styles.hint}>Comma separated</span>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Scheduled Publish</label>
                  <input
                    type="datetime-local"
                    name="scheduledPublish"
                    value={formData.scheduledPublish}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Featured Image {!editingBlog && <span className={styles.required}>*</span>}</label>
                <div className={styles.imageUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    id="featuredImage"
                  />
                  <label htmlFor="featuredImage" className={styles.fileLabel}>
                    <FiImage size={15} /> {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  {imagePreview && (
                    <div className={styles.imagePreview}>
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, featuredImage: null }));
                        }}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.seoSection}>
                <h3>SEO Settings</h3>
                <div className={styles.formGroup}>
                  <label>Meta Title</label>
                  <input
                    type="text"
                    name="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Meta title (60 chars max)"
                    maxLength="60"
                  />
                  <span className={styles.hint}>{formData.seo.metaTitle?.length || 0}/60</span>
                </div>
                <div className={styles.formGroup}>
                  <label>Meta Description</label>
                  <textarea
                    name="seo.metaDescription"
                    value={formData.seo.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Meta description (160 chars max)"
                    rows="2"
                    maxLength="160"
                  />
                  <span className={styles.hint}>{formData.seo.metaDescription?.length || 0}/160</span>
                </div>
                <div className={styles.formGroup}>
                  <label>Meta Keywords</label>
                  <input
                    type="text"
                    name="seo.metaKeywords"
                    value={formData.seo.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="jewellery, diamond, gold"
                  />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  Featured Blog
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={formData.isTrending}
                    onChange={handleInputChange}
                  />
                  Trending
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <FiLoader size={14} className={styles.spinning} /> Saving...
                    </>
                  ) : (
                    editingBlog ? 'Update Blog' : 'Create Blog'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;