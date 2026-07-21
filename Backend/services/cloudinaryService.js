// Backend/services/cloudinaryService.js

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Readable } from 'stream';
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
   * Upload buffer directly to Cloudinary (No local file saving)
   */
  async uploadBuffer(buffer, folder = 'banners', options = {}) {
    try {
      if (!buffer) {
        throw new Error('No buffer provided');
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `aurevian/${folder}`,
            resource_type: 'auto',
            ...options
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        // Convert buffer to stream and upload
        const stream = Readable.from(buffer);
        stream.pipe(uploadStream);
      });

      console.log(`✅ File uploaded to Cloudinary: ${result.public_id}`);
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
        assetId: result.asset_id
      };
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload file from local path (for compatibility)
   */
  async uploadFile(filePath, folder = 'banners', options = {}) {
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
        resource_type: 'auto',
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
        createdAt: result.created_at,
        assetId: result.asset_id
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
  }

  /**
   * Delete multiple files from Cloudinary
   */
  async deleteMultipleFiles(publicIds) {
    try {
      if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
        throw new Error('No publicIds provided');
      }

      const results = await Promise.all(
        publicIds.map(async (publicId) => {
          const result = await this.deleteFile(publicId);
          return {
            publicId,
            ...result
          };
        })
      );

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('❌ Cloudinary delete multiple error:', error.message);
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

  /**
   * Get image URL with specific transformations
   */
  getTransformedUrl(publicId, transformations = {}) {
    if (!publicId) return null;
    
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      ...transformations
    });
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(url) {
    if (!url) return null;
    try {
      // Remove everything before 'upload/'
      const uploadIndex = url.indexOf('upload/');
      if (uploadIndex === -1) return null;
      
      // Get everything after 'upload/'
      let afterUpload = url.substring(uploadIndex + 7);
      
      // Remove version and transformations if present
      const versionMatch = afterUpload.match(/^v\d+\//);
      if (versionMatch) {
        afterUpload = afterUpload.substring(versionMatch[0].length);
      }
      
      // Remove file extension
      const extIndex = afterUpload.lastIndexOf('.');
      if (extIndex !== -1) {
        afterUpload = afterUpload.substring(0, extIndex);
      }
      
      return afterUpload;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }
}

export default new CloudinaryService();