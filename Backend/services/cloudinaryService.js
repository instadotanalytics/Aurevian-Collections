// Backend/services/cloudinaryService.js

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Readable } from "stream";
import fs from "fs";

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
  async uploadBuffer(buffer, folder = "banners", options = {}) {
    try {
      if (!buffer) {
        throw new Error("No buffer provided");
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `aurevian/${folder}`,
            resource_type: "auto",
            ...options,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        // Convert buffer to stream and upload
        const stream = Readable.from(buffer);
        stream.pipe(uploadStream);
      });

      console.log(`✅ Banner uploaded to Cloudinary: ${result.public_id}`);
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
        assetId: result.asset_id,
      };
    } catch (error) {
      console.error("❌ Cloudinary upload error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload a file from a local disk path (used with multer diskStorage,
   * e.g. seller KYC documents). Deletes the local temp file afterward
   * regardless of whether the upload succeeded or failed.
   */
  async uploadFile(filePath, folder = "documents", options = {}) {
    try {
      if (!filePath) {
        throw new Error("No filePath provided");
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: `aurevian/${folder}`,
        resource_type: "auto",
        ...options,
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
        assetId: result.asset_id,
      };
    } catch (error) {
      console.error("❌ Cloudinary upload error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error(
            "⚠️ Failed to delete temp file:",
            filePath,
            err.message,
          );
        }
      });
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId) {
    try {
      if (!publicId) {
        throw new Error("No publicId provided");
      }

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        console.log(`✅ File deleted from Cloudinary: ${publicId}`);
        return {
          success: true,
          result: result,
        };
      } else {
        console.log(
          `⚠️ File deletion result: ${result.result} for ${publicId}`,
        );
        return {
          success: false,
          result: result,
          error: `Deletion failed with result: ${result.result}`,
        };
      }
    } catch (error) {
      console.error("❌ Cloudinary delete error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get optimized URL
   */
  getOptimizedUrl(publicId, options = {}) {
    if (!publicId) return null;

    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      ...options,
    });
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(publicId, width = 200, height = 200) {
    if (!publicId) return null;

    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      width: width,
      height: height,
      crop: "fill",
      gravity: "auto",
    });
  }
}

export default new CloudinaryService();
