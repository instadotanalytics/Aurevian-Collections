// Backend/controllers/blogController.js

import Blog from '../models/Blog.js';
import cloudinaryService from '../services/cloudinaryService.js';
import SuperAdmin from '../models/SuperAdmin.js';

// ============================================
// CREATE BLOG
// ============================================
export const createBlog = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      status,
      scheduledPublish,
      seo,
      isFeatured,
      isTrending,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!excerpt) {
      return res.status(400).json({
        success: false,
        message: 'Excerpt is required',
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Featured image is required',
      });
    }

    // Get admin details for author name
    const admin = await SuperAdmin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinaryService.uploadBuffer(
      req.file.buffer,
      'blog',
      {
        transformation: [
          { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      }
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: uploadResult.error,
      });
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    // Check if slug exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: 'A blog with similar title already exists. Please use a different title.',
      });
    }

    // Parse tags
    let tagArray = [];
    if (tags) {
      tagArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    // Parse SEO data
    let seoData = {};
    if (seo) {
      seoData = typeof seo === 'string' ? JSON.parse(seo) : seo;
    }

    // Create blog
    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tagArray,
      author: adminId,
      authorName: `${admin.firstName} ${admin.lastName}`,
      status: status || 'draft',
      scheduledPublish: scheduledPublish ? new Date(scheduledPublish) : null,
      seo: {
        metaTitle: seoData.metaTitle || title.substring(0, 60),
        metaDescription: seoData.metaDescription || excerpt.substring(0, 160),
        metaKeywords: seoData.metaKeywords || '',
        canonicalUrl: seoData.canonicalUrl || '',
        noIndex: seoData.noIndex || false,
        noFollow: seoData.noFollow || false,
        openGraph: {
          title: seoData.openGraph?.title || title,
          description: seoData.openGraph?.description || excerpt,
          image: seoData.openGraph?.image || uploadResult.url,
          url: seoData.openGraph?.url || '',
        },
      },
      featuredImage: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        alt: seoData.imageAlt || title,
      },
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isTrending: isTrending === 'true' || isTrending === true,
    });

    await blog.save();

    // If status is published, set publishedAt
    if (blog.status === 'published') {
      blog.publishedAt = new Date();
      await blog.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    console.error('❌ Create blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message,
    });
  }
};

// ============================================
// GET ALL BLOGS (Public)
// ============================================
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      tag,
      status = 'published',
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'firstName lastName email profileImage')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content'), // Don't send full content in list
      Blog.countDocuments(query),
    ]);

    // Get featured blogs
    const featured = await Blog.find({ status: 'published', isFeatured: true })
      .populate('author', 'firstName lastName')
      .limit(3)
      .select('-content');

    return res.status(200).json({
      success: true,
      data: blogs,
      featured,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Get all blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message,
    });
  }
};

// ============================================
// GET SINGLE BLOG BY SLUG (Public)
// ============================================
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'firstName lastName email profileImage')
      .populate('relatedPosts', 'title slug excerpt featuredImage');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    // Get related posts based on category and tags
    const related = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } },
      ],
    })
      .limit(4)
      .select('title slug excerpt featuredImage publishedAt');

    return res.status(200).json({
      success: true,
      data: blog,
      related,
    });
  } catch (error) {
    console.error('❌ Get blog by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message,
    });
  }
};

// ============================================
// GET ALL BLOGS (Admin)
// ============================================
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
    } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Blog.countDocuments(query),
    ]);

    const stats = {
      total: await Blog.countDocuments(),
      published: await Blog.countDocuments({ status: 'published' }),
      draft: await Blog.countDocuments({ status: 'draft' }),
      archived: await Blog.countDocuments({ status: 'archived' }),
    };

    return res.status(200).json({
      success: true,
      data: blogs,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Get all blogs admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message,
    });
  }
};

// ============================================
// UPDATE BLOG
// ============================================
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      status,
      scheduledPublish,
      seo,
      isFeatured,
      isTrending,
    } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Get admin details
    const admin = await SuperAdmin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Handle image update
    let imageData = blog.featuredImage;
    if (req.file) {
      if (blog.featuredImage.publicId) {
        await cloudinaryService.deleteFile(blog.featuredImage.publicId);
      }

      const uploadResult = await cloudinaryService.uploadBuffer(
        req.file.buffer,
        'blog',
        {
          transformation: [
            { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        }
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadResult.error,
        });
      }

      imageData = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        alt: title || blog.title,
      };
    }

    // Update fields
    if (title) {
      blog.title = title;
      blog.slug = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (tags) {
      blog.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    if (status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }
    if (scheduledPublish !== undefined) {
      blog.scheduledPublish = scheduledPublish ? new Date(scheduledPublish) : null;
    }
    if (seo) {
      const seoData = typeof seo === 'string' ? JSON.parse(seo) : seo;
      blog.seo = {
        ...blog.seo,
        ...seoData,
        openGraph: {
          ...blog.seo.openGraph,
          ...seoData.openGraph,
        },
      };
    }
    if (isFeatured !== undefined) blog.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isTrending !== undefined) blog.isTrending = isTrending === 'true' || isTrending === true;
    blog.featuredImage = imageData;
    blog.authorName = `${admin.firstName} ${admin.lastName}`;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    console.error('❌ Update blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message,
    });
  }
};

// ============================================
// DELETE BLOG
// ============================================
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Delete image from Cloudinary
    if (blog.featuredImage.publicId) {
      await cloudinaryService.deleteFile(blog.featuredImage.publicId);
    }

    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message,
    });
  }
};

// ============================================
// GET BLOG STATS
// ============================================
export const getBlogStats = async (req, res) => {
  try {
    const stats = {
      total: await Blog.countDocuments(),
      published: await Blog.countDocuments({ status: 'published' }),
      draft: await Blog.countDocuments({ status: 'draft' }),
      archived: await Blog.countDocuments({ status: 'archived' }),
      totalViews: await Blog.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      categories: await Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ Get blog stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get blog stats',
      error: error.message,
    });
  }
};

// ============================================
// SEARCH BLOGS
// ============================================
export const searchBlogs = async (req, res) => {
  try {
    const { q, category, tag, page = 1, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const query = {
      status: 'published',
      $text: { $search: q },
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .select('title slug excerpt featuredImage publishedAt category tags views'),
      Blog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Search blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search blogs',
      error: error.message,
    });
  }
};