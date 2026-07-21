// Backend/routes/blogRoutes.js

import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  updateBlog,
  deleteBlog,
  getBlogStats,
  searchBlogs,
} from '../controllers/blogController.js';
import { protectSuperAdmin } from '../middleware/superAdminAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', getAllBlogs);
router.get('/search', searchBlogs);
router.get('/:slug', getBlogBySlug);

// ============================================
// PROTECTED ROUTES (Super Admin only)
// ============================================
router.use(protectSuperAdmin);

router.post('/', upload.single('featuredImage'), createBlog);
router.get('/admin/all', getAllBlogsAdmin);
router.get('/admin/stats', getBlogStats);
router.put('/:id', upload.single('featuredImage'), updateBlog);
router.delete('/:id', deleteBlog);

export default router;