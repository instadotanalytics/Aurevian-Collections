// src/Pages/Blog/BlogDetail.jsx

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async'; // ✅ Import Helmet
import { fetchBlogBySlug } from '../../redux/slices/blogSlice';
import { FiCalendar, FiClock, FiEye, FiUser, FiArrowLeft, FiShare2, FiBookmark } from 'react-icons/fi';
import styles from './BlogDetail.module.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentBlog, isLoading } = useSelector((state) => state.blogs);

  useEffect(() => {
    if (slug) {
      dispatch(fetchBlogBySlug(slug));
    }
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [dispatch, slug]);

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className={styles.notFound}>
        <h2>Article not found</h2>
        <Link to="/blog">Back to Articles</Link>
      </div>
    );
  }

  // ✅ Generate JSON-LD Schema for better SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": currentBlog.title,
    "description": currentBlog.excerpt,
    "image": currentBlog.featuredImage?.url,
    "author": {
      "@type": "Person",
      "name": currentBlog.authorName
    },
    "datePublished": currentBlog.publishedAt,
    "dateModified": currentBlog.updatedAt,
    "publisher": {
      "@type": "Organization",
      "name": "Aurevian Collections",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aurevian.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://aurevian.com/blog/${currentBlog.slug}`
    }
  };

  return (
    <>
      {/* ✅ HELMET FOR SEO */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{currentBlog.seo?.metaTitle || currentBlog.title}</title>
        <meta name="description" content={currentBlog.seo?.metaDescription || currentBlog.excerpt} />
        <meta name="keywords" content={currentBlog.seo?.metaKeywords || currentBlog.tags?.join(', ')} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={currentBlog.seo?.canonicalUrl || `https://aurevian.com/blog/${currentBlog.slug}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://aurevian.com/blog/${currentBlog.slug}`} />
        <meta property="og:title" content={currentBlog.seo?.openGraph?.title || currentBlog.title} />
        <meta property="og:description" content={currentBlog.seo?.openGraph?.description || currentBlog.excerpt} />
        <meta property="og:image" content={currentBlog.seo?.openGraph?.image || currentBlog.featuredImage?.url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Aurevian Collections" />
        <meta property="article:published_time" content={currentBlog.publishedAt} />
        <meta property="article:modified_time" content={currentBlog.updatedAt} />
        <meta property="article:author" content={currentBlog.authorName} />
        <meta property="article:section" content={currentBlog.category} />
        {currentBlog.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://aurevian.com/blog/${currentBlog.slug}`} />
        <meta name="twitter:title" content={currentBlog.seo?.openGraph?.title || currentBlog.title} />
        <meta name="twitter:description" content={currentBlog.seo?.openGraph?.description || currentBlog.excerpt} />
        <meta name="twitter:image" content={currentBlog.seo?.openGraph?.image || currentBlog.featuredImage?.url} />
        <meta name="twitter:site" content="@Aurevian" />
        <meta name="twitter:creator" content="@Aurevian" />
        
        {/* Additional SEO */}
        <meta name="robots" content={currentBlog.seo?.noIndex ? 'noindex' : 'index, follow'} />
        <meta name="googlebot" content={currentBlog.seo?.noIndex ? 'noindex' : 'index, follow'} />
        <meta name="author" content={currentBlog.authorName} />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#106b47" />
      </Helmet>

      {/* ✅ JSON-LD Schema Script */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdSchema)}
      </script>

      {/* Blog Content */}
      <article className={styles.blogDetail}>
        <div className={styles.container}>
          <Link to="/blog" className={styles.backBtn}>
            <FiArrowLeft /> Back to Articles
          </Link>

          {/* Header */}
          <header className={styles.header}>
            <span className={styles.category}>{currentBlog.category}</span>
            <h1>{currentBlog.title}</h1>
            <div className={styles.meta}>
              <span><FiUser /> {currentBlog.authorName}</span>
              <span><FiCalendar /> {currentBlog.formattedDate}</span>
              <span><FiClock /> {currentBlog.readingTime || 1} min read</span>
              <span><FiEye /> {currentBlog.views || 0} views</span>
            </div>
            
            {/* Social Share Buttons */}
            <div className={styles.socialShare}>
              <button 
                onClick={() => {
                  navigator.share?.({
                    title: currentBlog.title,
                    text: currentBlog.excerpt,
                    url: window.location.href
                  });
                }}
                className={styles.shareBtn}
              >
                <FiShare2 /> Share
              </button>
            </div>
          </header>

          {/* Featured Image */}
          <div className={styles.featuredImage}>
            <img 
              src={currentBlog.featuredImage?.url} 
              alt={currentBlog.featuredImage?.alt || currentBlog.title} 
              loading="eager"
            />
          </div>

          {/* Content */}
          <div 
            className={styles.content} 
            dangerouslySetInnerHTML={{ __html: currentBlog.content }} 
          />

          {/* Tags */}
          {currentBlog.tags && currentBlog.tags.length > 0 && (
            <div className={styles.tags}>
              <h3>Tags:</h3>
              <div className={styles.tagList}>
                {currentBlog.tags.map((tag) => (
                  <Link key={tag} to={`/blog?tag=${tag}`} className={styles.tag}>
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          <div className={styles.authorBio}>
            <div className={styles.authorAvatar}>
              {currentBlog.author?.profileImage ? (
                <img src={currentBlog.author.profileImage} alt={currentBlog.authorName} />
              ) : (
                <span>{currentBlog.authorName?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className={styles.authorInfo}>
              <h4>{currentBlog.authorName}</h4>
              <p>Writer at Aurevian Collections</p>
            </div>
          </div>

          {/* Related Posts */}
          {currentBlog.relatedPosts && currentBlog.relatedPosts.length > 0 && (
            <div className={styles.relatedPosts}>
              <h3>Related Articles</h3>
              <div className={styles.relatedGrid}>
                {currentBlog.relatedPosts.map((post) => (
                  <Link key={post._id} to={`/blog/${post.slug}`} className={styles.relatedCard}>
                    <img src={post.featuredImage?.url} alt={post.title} />
                    <h4>{post.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
};

export default BlogDetail;