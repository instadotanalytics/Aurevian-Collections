// src/Pages/UserBlog/BlogList.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '../../redux/slices/blogSlice';
import { FiClock, FiEye, FiCalendar, FiSearch, FiArrowRight } from 'react-icons/fi';
import styles from './BlogList.module.css';

const BlogList = () => {
  const dispatch = useDispatch();
  const { blogs, isLoading, pagination } = useSelector((state) => state.blogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all', 'jewellery', 'diamonds', 'gold', 'bridal', 
    'fashion', 'care', 'trends', 'culture', 'sustainability'
  ];

  useEffect(() => {
    dispatch(fetchBlogs({ 
      page: currentPage, 
      limit: 6,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchTerm || undefined
    }));
  }, [dispatch, currentPage, selectedCategory, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(fetchBlogs({ 
      page: 1, 
      limit: 6,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchTerm || undefined
    }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && blogs.length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  return (
    <div className={styles.blogPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTag}>Latest from Aurevian Journal</span>
          <h1>Discover the latest trends, guides, and stories from the world of fine jewellery</h1>
          
          {/* Search */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>
        </div>

        {/* Categories */}
        <div className={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Blog List - Horizontal Layout */}
        {blogs && blogs.length > 0 ? (
          <>
            <div className={styles.blogList}>
              {blogs.map((blog, index) => (
                <Link to={`/blog/${blog.slug}`} key={blog._id} className={styles.blogRow}>
                  {/* Left Side - Content */}
                  <div className={styles.blogContent}>
                    <span className={styles.blogCategory}>{blog.category}</span>
                    <h2 className={styles.blogTitle}>{blog.title}</h2>
                    <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                    <div className={styles.blogMeta}>
                      <span>
                        <FiCalendar size={14} />
                        {formatDate(blog.publishedAt)}
                      </span>
                      <span>
                        <FiClock size={14} />
                        {blog.readingTime || 1} min read
                      </span>
                      <span>
                        <FiEye size={14} />
                        {blog.views || 0}
                      </span>
                    </div>
                  </div>
                  {/* Right Side - Image */}
                  <div className={styles.blogImage}>
                    <img 
                      src={blog.featuredImage?.url} 
                      alt={blog.featuredImage?.alt || blog.title} 
                      loading="lazy"
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {pagination.pages}
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>No articles found</h3>
            <p>Check back later for new content or try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;