// Backend/models/Banner.js

import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  offer: {
    type: String,
    trim: true,
    maxlength: [100, 'Offer text cannot exceed 100 characters']
  },
  subtext: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtext cannot exceed 200 characters']
  },
  image: {
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Image public ID is required']
    }
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
    trim: true
  },
  buttonLink: {
    type: String,
    default: '/shop',
    trim: true
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bannerSchema.index({ isActive: 1, order: 1 });
bannerSchema.index({ isFeatured: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if banner is currently active based on dates
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  return true;
});

// Ensure virtuals are included in JSON output
bannerSchema.set('toJSON', { virtuals: true });
bannerSchema.set('toObject', { virtuals: true });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;