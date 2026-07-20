// Backend/models/Blog.js

import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  featuredImage: {
    url: {
      type: String,
      required: [true, 'Featured image URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Image public ID is required'],
    },
    alt: {
      type: String,
      trim: true,
      default: '',
    },
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['jewellery', 'diamonds', 'gold', 'bridal', 'fashion', 'care', 'trends', 'culture', 'sustainability', 'other'],
      message: '{VALUE} is not a valid category',
    },
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  scheduledPublish: {
    type: Date,
    default: null,
  },
  seo: {
    metaTitle: { 
      type: String, 
      trim: true, 
      maxlength: 60,
      default: '',
    },
    metaDescription: { 
      type: String, 
      trim: true, 
      maxlength: 160,
      default: '',
    },
    metaKeywords: { 
      type: String, 
      trim: true,
      default: '',
    },
    canonicalUrl: { 
      type: String, 
      trim: true,
      default: '',
    },
    noIndex: { 
      type: Boolean, 
      default: false,
    },
    noFollow: { 
      type: Boolean, 
      default: false,
    },
    openGraph: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
      url: { type: String, default: '' },
    },
  },
  views: { 
    type: Number, 
    default: 0,
    index: true,
  },
  likes: { 
    type: Number, 
    default: 0,
  },
  comments: { 
    type: Number, 
    default: 0,
  },
  readingTime: { 
    type: Number, 
    default: 0,
  },
  isFeatured: { 
    type: Boolean, 
    default: false,
    index: true,
  },
  isTrending: { 
    type: Boolean, 
    default: false,
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
  }],
}, {
  timestamps: true,
});

// ============================================
// ✅ PRE-SAVE MIDDLEWARE - Mongoose v9 Compatible
// ============================================

// Method 1: Using async/await (Recommended for v9)
blogSchema.pre('save', async function() {
  // Generate slug from title
  if (this.isModified('title')) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-'); // Remove multiple dashes
    
    // Check if slug already exists
    const existingBlog = await this.constructor.findOne({ 
      slug: slug, 
      _id: { $ne: this._id } 
    });
    
    if (existingBlog) {
      // Add random suffix if slug exists
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }
    
    this.slug = slug;
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Calculate reading time (approx 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  // Set SEO meta title if not provided
  if (!this.seo.metaTitle && this.title) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }

  // Set SEO meta description if not provided
  if (!this.seo.metaDescription && this.excerpt) {
    this.seo.metaDescription = this.excerpt.substring(0, 160);
  }

  // Set Open Graph image if not provided
  if (!this.seo.openGraph.image && this.featuredImage?.url) {
    this.seo.openGraph.image = this.featuredImage.url;
  }

  // Set Open Graph title if not provided
  if (!this.seo.openGraph.title && this.title) {
    this.seo.openGraph.title = this.title;
  }

  // Set Open Graph description if not provided
  if (!this.seo.openGraph.description && this.excerpt) {
    this.seo.openGraph.description = this.excerpt;
  }
});

// ============================================
// ✅ VIRTUAL FIELDS
// ============================================

blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

blogSchema.virtual('formattedDate').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

blogSchema.virtual('formattedDateShort').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

// ============================================
// ✅ STATIC METHODS
// ============================================

blogSchema.statics.getPublished = function() {
  return this.find({ status: 'published' });
};

blogSchema.statics.getFeatured = function(limit = 3) {
  return this.find({ status: 'published', isFeatured: true })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

blogSchema.statics.getTrending = function(limit = 5) {
  return this.find({ status: 'published', isTrending: true })
    .sort({ views: -1, publishedAt: -1 })
    .limit(limit);
};

// ============================================
// ✅ TO JSON / TO OBJECT
// ============================================

blogSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

blogSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// ============================================
// ✅ COMPOUND INDEXES
// ============================================

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1, status: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

// ============================================
// ✅ MODEL CREATION
// ============================================

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;