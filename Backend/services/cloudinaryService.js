// services/cloudinaryService.js

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Upload file to Cloudinary
   */
  async uploadFile(filePath, folder = 'sellers', options = {}) {
    try {
      if (!filePath) {
        throw new Error('No file path provided');
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: `aurevian/${folder}`,
        resource_type: 'auto',
        ...options
      });

      // Delete local file after upload
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.log('Error deleting local file:', err.message);
      }

      console.log(`✅ File uploaded to Cloudinary: ${result.public_id}`);
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error.message);
      
      // Delete local file even if upload fails
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.log('Error deleting local file:', err.message);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files, folder = 'sellers') {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file.path, folder)
      );
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('❌ Cloudinary multiple upload error:', error.message);
      return [];
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId) {
    try {
      if (!publicId) {
        throw new Error('No publicId provided');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`✅ File deleted from Cloudinary: ${publicId}`);
      return {
        success: result.result === 'ok',
        result
      };
    } catch (error) {
      console.error('❌ Cloudinary delete error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get optimized URL
   */
  getOptimizedUrl(publicId, options = {}) {
    if (!publicId) return null;
    
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      ...options
    });
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(publicId, width = 200, height = 200) {
    if (!publicId) return null;
    
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      width: width,
      height: height,
      crop: 'fill',
      gravity: 'auto'
    });
  }
}

export default new CloudinaryService();