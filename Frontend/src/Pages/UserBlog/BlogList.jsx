// src/Pages/UserBlog/BlogList.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '../../redux/slices/blogSlice';
import { FiClock, FiEye, FiCalendar, FiSearch, FiArrowRight, FiX } from 'react-icons/fi';
import styles from './BlogList.module.css';

const BlogList = () => {
  const dispatch = useDispatch();
  const { blogs, isLoading, pagination } = useSelector((state) => state.blogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState(''); // ✅ Separate input state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    'all', 'jewellery', 'diamonds', 'gold', 'bridal',
    'fashion', 'care', 'trends', 'culture', 'sustainability'
  ];

  // ✅ Debounce search - only search after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputValue !== searchTerm) {
        setSearchTerm(searchInputValue);
        setCurrentPage(1);
        // ✅ Fetch blogs with search term
        dispatch(fetchBlogs({
          page: 1,
          limit: 6,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchInputValue.trim() || undefined
        }));
      }
    }, 500); // ✅ Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInputValue, selectedCategory, dispatch]);

  // ✅ Fetch blogs when page or category changes
  useEffect(() => {
    dispatch(fetchBlogs({
      page: currentPage,
      limit: 6,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchTerm.trim() || undefined
    }));
  }, [dispatch, currentPage, selectedCategory, searchTerm]);

  // ✅ Handle search input change - only updates input value, doesn't trigger search immediately
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInputValue(value);
    // ✅ Reset to page 1 when typing
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // ✅ Handle search submit (when user presses Enter or clicks search button)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInputValue.trim() !== searchTerm) {
      setSearchTerm(searchInputValue);
      setCurrentPage(1);
      dispatch(fetchBlogs({
        page: 1,
        limit: 6,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchInputValue.trim() || undefined
      }));
    }
  };

  // ✅ Clear search
  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchTerm('');
    setCurrentPage(1);
    dispatch(fetchBlogs({
      page: 1,
      limit: 6,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: undefined
    }));
  };

  // ✅ Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    // ✅ Don't reset search term, keep it
    dispatch(fetchBlogs({
      page: 1,
      limit: 6,
      category: category !== 'all' ? category : undefined,
      search: searchTerm.trim() || undefined
    }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ Show loading only on initial load
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

            {/* ✅ Search Form with clear button */}
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchInputValue}
                  onChange={handleSearchInputChange}
                  className={styles.searchInput}
                  aria-label="Search articles"
                />
                {searchInputValue && (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                  >
                    <FiX size={16} />
                  </button>
                )}
                <button type="submit" className={styles.searchBtn}>
                  Search
                </button>
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

        {/* ✅ Show search results info */}
        {searchTerm && (
          <div className={styles.searchInfo}>
            <span>
              Showing results for: <strong>"{searchTerm}"</strong>
            </span>
            <button onClick={handleClearSearch} className={styles.clearSearchBtn}>
              <FiX size={14} /> Clear
            </button>
          </div>
        )}

        {/* Blog List */}
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
            <p>
              {searchTerm 
                ? `No results found for "${searchTerm}". Try a different search.` 
                : 'Check back later for new content.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;