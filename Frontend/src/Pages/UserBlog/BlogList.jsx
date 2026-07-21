
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

  // Split the first article out so it can be rendered as the large,
  // Vogue-style featured piece. Everything else keeps its original order.
  const [featuredBlog, ...restBlogs] = blogs || [];

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
              </div>
              <button type="submit" className={styles.searchBtn}>Search</button>
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

        {/* Blog List */}
        {blogs && blogs.length > 0 ? (
          <>
            {/* Featured Article */}
            {featuredBlog && (
              <Link to={`/blog/${featuredBlog.slug}`} className={styles.featured}>
                <div className={styles.featuredImageWrap}>
                  <img
                    src={featuredBlog.featuredImage?.url}
                    alt={featuredBlog.featuredImage?.alt || featuredBlog.title}
                    loading="eager"
                  />
                  <span className={styles.featuredBadge}>Featured</span>
                </div>
                <div className={styles.featuredBody}>
                  <span className={styles.featuredEyebrow}>{featuredBlog.category}</span>
                  <h2 className={styles.featuredTitle}>{featuredBlog.title}</h2>
                  <p className={styles.featuredExcerpt}>{featuredBlog.excerpt}</p>
                  <div className={styles.featuredMeta}>
                    <span>
                      <FiCalendar size={14} />
                      {formatDate(featuredBlog.publishedAt)}
                    </span>
                    <span>
                      <FiClock size={14} />
                      {featuredBlog.readingTime || 1} min read
                    </span>
                    <span>
                      <FiEye size={14} />
                      {featuredBlog.views || 0}
                    </span>
                  </div>
                  <span className={styles.readBtn}>
                    Read Article <FiArrowRight />
                  </span>
                </div>
              </Link>
            )}

            {/* Remaining Articles — alternating magazine layout */}
            <div className={styles.blogList}>
              {restBlogs.map((blog, index) => (
                <Link
                  to={`/blog/${blog.slug}`}
                  key={blog._id}
                  className={`${styles.magazineCard} ${index % 2 === 1 ? styles.reverse : ''}`}
                >
                  <div className={styles.magazineImage}>
                    <img
                      src={blog.featuredImage?.url}
                      alt={blog.featuredImage?.alt || blog.title}
                      loading="lazy"
                    />
                    <span className={styles.categoryBadge}>{blog.category}</span>
                  </div>
                  <div className={styles.magazineContent}>
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