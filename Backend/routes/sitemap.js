// Backend/routes/sitemap.js
import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt');
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  // Add static pages
  const staticPages = ['/', '/blog', '/about', '/contact', '/shop'];
  staticPages.forEach(page => {
    sitemap += `
    <url>
      <loc>https://aurevian.com${page}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  });
  
  // Add blog posts
  blogs.forEach(blog => {
    sitemap += `
    <url>
      <loc>https://aurevian.com/blog/${blog.slug}</loc>
      <lastmod>${blog.updatedAt.toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`;
  });
  
  sitemap += `</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

export default router;