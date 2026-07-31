// backend/models/JewelleryProduct.js

import mongoose from "mongoose";
import slugify from "slugify";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a unique SKU for jewellery products
 * Format: JWL-XXXXX-YYYY (JWL = Jewellery, XXXXX = random, YYYY = sellerId suffix)
 */
const generateSKU = (sellerId) => {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const sellerSuffix = sellerId.toString().slice(-4).toUpperCase();
  return `JWL-${random}-${sellerSuffix}`;
};

/**
 * Generate a unique slug from product name
 */
const generateSlug = (productName) => {
  const baseSlug = slugify(productName, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-'
  });
  return baseSlug;
};

// ============================================
// SUPPORTING SCHEMAS
// ============================================

/**
 * Product Variants Schema
 * Supports: Color, Size, Price, Images, Stock
 */
const productVariantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  attributes: {
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    material: String,
    stoneType: String,
  },
  price: {
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function(value) {
          if (value && this.price && this.price.originalPrice) {
            return value <= this.price.originalPrice;
          }
          return true;
        },
        message: 'Sale price cannot be greater than original price'
      }
    },
  },
  stock: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxOrderQty: {
      type: Number,
      min: 1,
    },
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    altText: String,
    isDefault: {
      type: Boolean,
      default: false,
    },
  }],
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'mg', 'oz', 'kg'],
      default: 'g',
    },
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// ============================================
// MAIN JEWELLERY PRODUCT SCHEMA
// ============================================

const jewelleryProductSchema = new mongoose.Schema({
  // ==========================================
  // BASIC INFORMATION
  // ==========================================
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true,
  },
  
  productSlug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
    default: '',
  },
  
  fullDescription: {
    type: String,
    default: '',
  },
  
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    index: true,
  },
  
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },

  // ==========================================
  // CATEGORY (From Header Config - Super Admin Controlled)
  // ==========================================
  category: {
    categoryId: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    categoryData: {
      id: String,
      label: String,
      path: String,
      image: String,
    },
    subCategoryId: {
      type: String,
      index: true,
    },
    subCategoryData: {
      id: String,
      label: String,
      path: String,
      image: String,
    },
  },

  // ==========================================
  // PRODUCT IMAGES
  // ==========================================
  thumbnail: {
    url: {
      type: String,
      required: [true, 'Thumbnail image is required'],
    },
    publicId: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: '',
    },
  },
  
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],

  // ==========================================
  // PRICING
  // ==========================================
  pricing: {
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function(value) {
          if (value && this.pricing && this.pricing.originalPrice) {
            return value <= this.pricing.originalPrice;
          }
          return true;
        },
        message: 'Sale price cannot be greater than original price'
      }
    },
    costPrice: {
      type: Number,
      min: 0,
      select: false,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    taxIncluded: {
      type: Boolean,
      default: true,
    },
  },

  // ==========================================
  // INVENTORY
  // ==========================================
  inventory: {
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: 0,
      default: 0,
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxOrderQty: {
      type: Number,
      min: 1,
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Pre Order'],
      default: 'Out of Stock',
      required: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },

  // ==========================================
  // JEWELLERY SPECIFICATIONS
  // ==========================================
  specifications: {
    material: {
      type: String,
      required: [true, 'Material is required'],
      enum: [
        'Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold', 
        'Sterling Silver', 'Brass', 'Copper', 'Titanium', 'Palladium',
        'Steel', 'Other'
      ],
      default: 'Gold',
    },
    plating: {
      type: String,
      enum: [
        'Gold Plated', 'Silver Plated', 'Rhodium Plated', 
        'Rose Gold Plated', 'White Gold Plated', 'None', 'Other'
      ],
      default: 'None',
    },
    stoneType: {
      type: String,
      enum: [
        'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl',
        'Cubic Zirconia', 'Moissanite', 'Topaz', 'Amethyst',
        'Garnet', 'Opal', 'Turquoise', 'None', 'Other'
      ],
      default: 'None',
    },
    stoneColor: {
      type: String,
      enum: [
        'White', 'Yellow', 'Blue', 'Red', 'Green', 'Pink',
        'Purple', 'Black', 'Clear', 'Champagne', 'Rose', 'Other'
      ],
      default: 'Clear',
    },
    finish: {
      type: String,
      enum: [
        'Polished', 'Matte', 'Brushed', 'Hammered', 'Textured',
        'Antique', 'Mirror', 'Satin', 'Other'
      ],
      default: 'Polished',
    },
    weight: {
      value: {
        type: Number,
        min: 0,
      },
      unit: {
        type: String,
        enum: ['g', 'mg', 'oz', 'kg'],
        default: 'g',
      },
    },
    size: {
      type: String,
      enum: [
        'XS', 'S', 'M', 'L', 'XL', 'XXL',
        '6', '7', '8', '9', '10', '11', '12',
        'Free Size', 'Adjustable', 'Custom', 'Other'
      ],
      default: 'Free Size',
    },
    adjustable: {
      type: Boolean,
      default: false,
    },
    occasion: {
      type: String,
      enum: [
        'Wedding', 'Engagement', 'Anniversary', 'Birthday', 'Casual',
        'Party', 'Festive', 'Professional', 'Gift', 'Daily Wear',
        'Valentine', 'Mother\'s Day', 'Graduation', 'Other'
      ],
      default: 'Casual',
    },
    style: {
      type: String,
      enum: [
        'Classic', 'Modern', 'Vintage', 'Antique', 'Minimalist',
        'Statement', 'Bohemian', 'Ethnic', 'Contemporary', 'Art Deco',
        'Victorian', 'Romantic', 'Geometric', 'Floral', 'Other'
      ],
      default: 'Modern',
    },
    collection: {
      type: String,
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex', 'Kids'],
      default: 'Unisex',
    },
  },

  // ==========================================
  // PRODUCT VARIANTS
  // ==========================================
  hasVariants: {
    type: Boolean,
    default: false,
  },
  variants: [productVariantSchema],

  // ==========================================
  // SHIPPING (NO CHARGES STORED)
  // ==========================================
  shipping: {
    weight: {
      value: {
        type: Number,
        required: [true, 'Weight is required'],
        min: 0,
      },
      unit: {
        type: String,
        enum: ['g', 'kg', 'oz', 'lb'],
        default: 'g',
      },
    },
    dimensions: {
      length: {
        type: Number,
        required: [true, 'Length is required'],
        min: 0,
      },
      width: {
        type: Number,
        required: [true, 'Width is required'],
        min: 0,
      },
      height: {
        type: Number,
        required: [true, 'Height is required'],
        min: 0,
      },
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    shippingType: {
      type: String,
      enum: ['Seller Pays', 'Customer Pays'],
      default: 'Customer Pays',
      required: true,
    },
  },

  // ==========================================
  // RETURN POLICY
  // ==========================================
  returnPolicy: {
    returnAvailable: {
      type: Boolean,
      default: true,
    },
    returnDays: {
      type: Number,
      default: 7,
      min: 0,
    },
    warrantyAvailable: {
      type: Boolean,
      default: false,
    },
    warrantyDuration: {
      type: String,
      enum: ['1 Month', '3 Months', '6 Months', '1 Year', '2 Years', '5 Years', 'Lifetime'],
      default: '1 Year',
    },
  },

  // ==========================================
  // SEO
  // ==========================================
  seo: {
    title: {
      type: String,
      maxlength: [60, 'SEO title cannot exceed 60 characters'],
      default: function() {
        return this.productName;
      },
    },
    description: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
      default: function() {
        return this.shortDescription;
      },
    },
    keywords: {
      type: [String],
      default: [],
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    metaRobots: {
      type: String,
      enum: ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'],
      default: 'index, follow',
    },
    schemaMarkup: {
      type: Object,
      default: null,
    },
  },

  // ==========================================
  // PRODUCT LABELS
  // ==========================================
  labels: {
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    flashSale: {
      type: Boolean,
      default: false,
    },
  },

  // ==========================================
  // REVIEWS & RATINGS
  // ==========================================
  reviews: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },

  // ==========================================
  // SELLER INFORMATION
  // ==========================================
  seller: {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      default: function() {
        return this.seller.sellerId;
      },
    },
    sellerName: String,
    sellerEmail: String,
    storeName: String,
  },

  // ==========================================
  // STATUS
  // ==========================================
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Published', 'Scheduled', 'Archived', 'Rejected'],
    default: 'Draft',
    required: true,
    index: true,
  },
  
  scheduledPublishDate: {
    type: Date,
    default: null,
  },

  // ==========================================
  // ADMIN CONTROLS
  // ==========================================
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  isApproved: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
  },
  
  approvedAt: Date,
  
  rejectionReason: {
    type: String,
    default: null,
  },

  // ==========================================
  // METADATA
  // ==========================================
  viewedCount: {
    type: Number,
    default: 0,
  },
  
  wishlistCount: {
    type: Number,
    default: 0,
  },
  
  tags: {
    type: [String],
    default: [],
    index: true,
  },

  aiGenerated: {
    description: {
      type: Boolean,
      default: false,
    },
    seo: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: Boolean,
      default: false,
    },
    suggestions: {
      type: Object,
      default: null,
    },
  },

}, {
  timestamps: true,
});

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

jewelleryProductSchema.index({ 'category.categoryId': 1 });
jewelleryProductSchema.index({ 'category.subCategoryId': 1 });
jewelleryProductSchema.index({ 
  'category.categoryData.label': 'text',
  'category.subCategoryData.label': 'text',
  productName: 'text',
  brand: 'text',
});
jewelleryProductSchema.index({ 'pricing.salePrice': 1 });
jewelleryProductSchema.index({ 'inventory.availability': 1 });
jewelleryProductSchema.index({ 'labels.featured': 1, 'labels.trending': 1 });
jewelleryProductSchema.index({ createdAt: -1 });
jewelleryProductSchema.index({ 'reviews.averageRating': -1 });
jewelleryProductSchema.index({ 'seller.sellerId': 1, status: 1 });

// ============================================
// MIDDLEWARE - PRE-SAVE HOOKS
// ============================================

jewelleryProductSchema.pre('save', async function(next) {
  try {
    const Seller = mongoose.model('Seller');
    const seller = await Seller.findById(this.seller.sellerId);
    
    // Generate SKU if not provided
    if (!this.sku) {
      this.sku = generateSKU(this.seller.sellerId);
    }

    // Generate slug from product name
    if (this.isModified('productName') && !this.isModified('productSlug')) {
      let slug = generateSlug(this.productName);
      // Check if slug already exists
      const existingProduct = await mongoose.model('JewelleryProduct').findOne({
        productSlug: slug,
        _id: { $ne: this._id },
      });
      if (existingProduct) {
        slug = `${slug}-${Date.now().toString().slice(-6)}`;
      }
      this.productSlug = slug;
    }

    // Set SEO title if not provided
    if (!this.seo?.title) {
      this.seo.title = this.productName;
    }

    // Set SEO description if not provided
    if (!this.seo?.description) {
      this.seo.description = this.shortDescription;
    }

    // Update inventory availability based on stock quantity
    if (this.inventory.stockQuantity <= 0) {
      this.inventory.availability = 'Out of Stock';
    } else if (this.inventory.availability !== 'Pre Order') {
      this.inventory.availability = 'In Stock';
    }

    // Check product limit based on subscription
    await this.checkProductLimit(seller);
  } catch (error) {
    return next(error);
  }
  
  next();
});

// ============================================
// VIRTUAL FIELDS
// ============================================

jewelleryProductSchema.virtual('isInStock').get(function() {
  return this.inventory.availability === 'In Stock';
});

jewelleryProductSchema.virtual('isPreOrder').get(function() {
  return this.inventory.availability === 'Pre Order';
});

jewelleryProductSchema.virtual('isOutOfStock').get(function() {
  return this.inventory.availability === 'Out of Stock';
});

jewelleryProductSchema.virtual('displayPrice').get(function() {
  return this.pricing.salePrice || this.pricing.originalPrice;
});

jewelleryProductSchema.virtual('discountPercentage').get(function() {
  if (this.pricing.salePrice && this.pricing.originalPrice) {
    return Math.round(
      ((this.pricing.originalPrice - this.pricing.salePrice) / this.pricing.originalPrice) * 100
    );
  }
  return 0;
});

// ============================================
// INSTANCE METHODS
// ============================================

jewelleryProductSchema.methods.checkProductLimit = async function(seller) {
  if (!seller) {
    const Seller = mongoose.model('Seller');
    seller = await Seller.findById(this.seller.sellerId);
  }

  // Get seller's subscription plan
  const SubscriptionPlan = mongoose.model('SubscriptionPlan');
  const plan = await SubscriptionPlan.findOne({ id: seller.subscriptionPlanId || 'free' });

  if (!plan) return;

  // Check product limit (-1 means unlimited)
  if (plan.productLimit === -1) return;

  // Count existing products for this seller
  const JewelleryProduct = mongoose.model('JewelleryProduct');
  const productCount = await JewelleryProduct.countDocuments({
    'seller.sellerId': seller._id,
    status: { $ne: 'Archived' },
    _id: { $ne: this._id },
  });

  if (productCount >= plan.productLimit) {
    const error = new Error(
      `Product limit reached. Your ${plan.name} plan allows ${plan.productLimit} products. ` +
      `Please upgrade your plan to add more products.`
    );
    error.name = 'ProductLimitError';
    throw error;
  }
};

// ============================================
// STATIC METHODS
// ============================================

jewelleryProductSchema.statics.getProductsBySeller = async function(sellerId, filters = {}) {
  const query = { 'seller.sellerId': sellerId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.categoryId) {
    query['category.categoryId'] = filters.categoryId;
  }
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 });
};

jewelleryProductSchema.statics.getProductLimitStatus = async function(sellerId) {
  const Seller = mongoose.model('Seller');
  const seller = await Seller.findById(sellerId);
  if (!seller) {
    throw new Error('Seller not found');
  }

  const SubscriptionPlan = mongoose.model('SubscriptionPlan');
  const plan = await SubscriptionPlan.findOne({ id: seller.subscriptionPlanId || 'free' });

  if (!plan) {
    return { limit: 0, used: 0, remaining: 0, isUnlimited: false };
  }

  if (plan.productLimit === -1) {
    return { limit: -1, used: 0, remaining: -1, isUnlimited: true };
  }

  const used = await this.countDocuments({
    'seller.sellerId': sellerId,
    status: { $ne: 'Archived' },
  });

  return {
    limit: plan.productLimit,
    used,
    remaining: plan.productLimit - used,
    isUnlimited: false,
    planName: plan.name,
  };
};

// ============================================
// COMPOUND INDEXES FOR UNIQUE CONSTRAINTS
// ============================================

jewelleryProductSchema.index(
  { 'seller.sellerId': 1, productSlug: 1 },
  { unique: true }
);

jewelleryProductSchema.index(
  { 'seller.sellerId': 1, sku: 1 },
  { unique: true }
);

// ============================================
// TO JSON TRANSFORM
// ============================================

jewelleryProductSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive fields
    delete ret.pricing?.costPrice;
    delete ret.__v;
    return ret;
  },
});

jewelleryProductSchema.set('toObject', {
  virtuals: true,
});

// ============================================
// CREATE MODEL
// ============================================

const JewelleryProduct = mongoose.model('JewelleryProduct', jewelleryProductSchema);

export default JewelleryProduct;