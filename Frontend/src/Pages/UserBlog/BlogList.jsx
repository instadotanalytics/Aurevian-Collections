
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
        {/* Hero / Header */}
        <div className={styles.hero}>
          <div className={styles.header}>
            <span className={styles.headerTag}>Aurevian Journal</span>
            <h1>Discover the latest trends, guides, and stories from the world of fine jewellery</h1>
            <p className={styles.heroSubtitle}>
              Curated reading on craftsmanship, diamonds and the art of fine jewellery — for those who
              appreciate the story behind every piece.
            </p>

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
                  aria-label="Search articles"
                />
              <button type="submit" className={styles.searchBtn}>Search</button>
              </div>
            </form>
          </div>
        </div>

        {/* Categories */}
        <div className={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={selectedCategory === cat}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Blog List — image-first cards, 3 columns desktop / 2 columns mobile
            (see .blogGrid in BlogList.module.css for the responsive rules) */}
        {blogs && blogs.length > 0 ? (
          <>
            <div className={styles.blogGrid}>
              {blogs.map((blog, index) => (
                <Link
                  to={`/blog/${blog.slug}`}
                  key={blog._id}
                  className={styles.blogCard}
                >
                  <div className={styles.cardImage}>
                    <img
                      src={blog.featuredImage?.url}
                      alt={blog.featuredImage?.alt || blog.title}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>

                  <div className={styles.cardContent}>
                    {/* Category + date now sit BELOW the photo, not on top
                        of it — no more text overlaid on the image. */}
                    <div className={styles.cardBadgeRow}>
                      <span className={styles.cardCategory}>{blog.category}</span>
                      <span className={styles.cardDate}>
                        <FiCalendar size={11} />
                        {formatDate(blog.publishedAt)}
                      </span>
                    </div>
                    <h2 className={styles.cardTitle}>{blog.title}</h2>
                    <p className={styles.cardExcerpt}>{blog.excerpt}</p>
                    <div className={styles.cardMeta}>
                      <span>
                        <FiClock size={13} />
                        {blog.readingTime || 1} min read
                      </span>
                      <span>
                        <FiEye size={13} />
                        {blog.views || 0}
                      </span>
                    </div>
                    <span className={styles.readBtn}>
                      Read Article <FiArrowRight />
                    </span>
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