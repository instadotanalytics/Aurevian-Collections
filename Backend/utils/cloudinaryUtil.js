// Backend/utils/cloudinaryUtil.js

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary from local file path
 */
const uploadToCloudinary = async (filePath, folder = 'avatars', options = {}) => {
  try {
    if (!filePath) {
      throw new Error('No file path provided');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `aurevian/${folder}`,
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto',
      ...options
    });
    
    // Delete local file after upload
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Local file deleted: ${filePath}`);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }
    
    console.log(`✅ File uploaded to Cloudinary: ${result.public_id}`);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    // Try to delete local file even if upload fails
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkError) {
      console.error('Error deleting local file after failed upload:', unlinkError);
    }
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete file from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No publicId provided');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`✅ File deleted from Cloudinary: ${publicId}`);
      return {
        success: true,
        result: result
      };
    } else {
      console.log(`⚠️ File deletion result: ${result.result} for ${publicId}`);
      return {
        success: false,
        result: result,
        error: `Deletion failed with result: ${result.result}`
      };
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
};

/**
 * Get thumbnail URL
 */
const getThumbnailUrl = (publicId, width = 200, height = 200) => {
  if (!publicId) return null;
  
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width: width,
    height: height,
    crop: 'fill',
    gravity: 'auto'
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
  getThumbnailUrl
};