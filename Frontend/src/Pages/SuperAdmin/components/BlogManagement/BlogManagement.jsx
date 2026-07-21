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
  FiTag,
  FiCalendar,
  FiClock,
  FiUser,
  FiImage,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import styles from './BlogManagement.module.css';

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

  // Fetch blogs on mount and when filters change
  useEffect(() => {
    fetchBlogs();
  }, [currentPage, filterStatus, selectedCategory, searchTerm]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBlogError());
    }
  }, [error, dispatch]);

  const fetchBlogs = () => {
    const params = {
      page: currentPage,
      limit: 10,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    };
    if (searchTerm) params.search = searchTerm;
    dispatch(fetchAllBlogsAdmin(params));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, [seoField]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
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
      seo: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
      },
      featuredImage: null,
      scheduledPublish: '',
    });
    setImagePreview(null);
    setEditingBlog(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error('Excerpt is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (!formData.featuredImage && !editingBlog) {
      toast.error('Featured image is required');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)));
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

      let result;
      if (editingBlog) {
        result = await dispatch(updateBlog({ 
          id: editingBlog._id, 
          formData: formDataToSend 
        })).unwrap();
        toast.success('Blog updated successfully!');
      } else {
        result = await dispatch(createBlog(formDataToSend)).unwrap();
        toast.success('Blog created successfully!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error) {
      toast.error(error || 'Failed to save blog');
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
      } catch (error) {
        toast.error(error || 'Failed to delete blog');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      published: { label: 'Published', className: styles.published },
      draft: { label: 'Draft', className: styles.draft },
      archived: { label: 'Archived', className: styles.archived },
    };
    return statusMap[status] || statusMap.draft;
  };

  const getCategoryLabel = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine what to show based on activeTab
  const getFilterStatus = () => {
    switch (activeTab) {
      case 'blog-drafts':
        return 'draft';
      case 'blog-published':
        return 'published';
      default:
        return filterStatus;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Blog Management</h1>
          <p>Create and manage your blog posts</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.createBtn}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <FiPlus /> Create Blog
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.total}`}>
            <span className={styles.statNumber}>{stats.total || 0}</span>
            <span className={styles.statLabel}>Total Blogs</span>
          </div>
          <div className={`${styles.statCard} ${styles.published}`}>
            <span className={styles.statNumber}>{stats.published || 0}</span>
            <span className={styles.statLabel}>Published</span>
          </div>
          <div className={`${styles.statCard} ${styles.draft}`}>
            <span className={styles.statNumber}>{stats.draft || 0}</span>
            <span className={styles.statLabel}>Drafts</span>
          </div>
          <div className={`${styles.statCard} ${styles.archived}`}>
            <span className={styles.statNumber}>{stats.archived || 0}</span>
            <span className={styles.statLabel}>Archived</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select 
          className={styles.filterSelect}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading blogs...</p>
          </div>
        ) : blogs && blogs.length > 0 ? (
          <>
            <table className={styles.blogTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className={styles.imageCell}>
                      <img src={blog.featuredImage?.url} alt={blog.title} />
                    </td>
                    <td className={styles.titleCell}>
                      <div className={styles.title}>{blog.title}</div>
                      <div className={styles.excerpt}>{blog.excerpt?.substring(0, 80)}...</div>
                    </td>
                    <td>
                      <span className={styles.categoryCell}>
                        {getCategoryLabel(blog.category)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadge(blog.status).className}`}>
                        <span className={styles.dot}></span>
                        {getStatusBadge(blog.status).label}
                      </span>
                    </td>
                    <td className={styles.viewsCell}>
                      <FiEye /> {blog.views || 0}
                    </td>
                    <td className={styles.dateCell}>
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button 
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => handleEdit(blog)}
                      >
                        <FiEdit /> Edit
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDelete(blog._id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </div>
                <div className={styles.paginationControls}>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span className={styles.pageNumber}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <FiFileText size={60} />
            <h3>No blogs found</h3>
            <p>Create your first blog post to get started</p>
            <button 
              className={styles.createBtn}
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              <FiPlus /> Create Blog
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* Basic Info */}
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
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
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
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
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

              {/* Featured Image */}
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
                    <FiImage /> {imagePreview ? 'Change Image' : 'Upload Image'}
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
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Section */}
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

              {/* Checkboxes */}
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

              {/* Actions */}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <FiLoader className={styles.spinning} /> Saving...
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