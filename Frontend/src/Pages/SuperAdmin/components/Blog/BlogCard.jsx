// src/Components/Blog/BlogCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiEye, FiCalendar } from 'react-icons/fi';
import styles from './BlogCard.module.css';

const BlogCard = ({ blog }) => {
  const { title, slug, excerpt, featuredImage, publishedAt, category, views, readingTime } = blog;

  return (
    <Link to={`/blog/${slug}`} className={styles.blogCard}>
      <div className={styles.imageWrapper}>
        <img src={featuredImage?.url} alt={featuredImage?.alt || title} loading="lazy" />
        <span className={styles.category}>{category}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.excerpt}>{excerpt}</p>
        <div className={styles.meta}>
          <span>
            <FiCalendar size={14} />
            {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'Draft'}
          </span>
          <span>
            <FiClock size={14} />
            {readingTime || 1} min read
          </span>
          <span>
            <FiEye size={14} />
            {views || 0}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;