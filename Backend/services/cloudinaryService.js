// Backend/services/cloudinaryService.js

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Readable } from "stream";
import fs from "fs";

dotenv.config();

/* ==========================================================
   Cloudinary Configuration
========================================================== */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /* ==========================================================
     Upload Buffer (Memory Storage)
  ========================================================== */

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

        Readable.from(buffer).pipe(uploadStream);
      });

      console.log(`✅ Uploaded: ${result.public_id}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        assetId: result.asset_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error("❌ Cloudinary Upload Error:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /* ==========================================================
     Upload Local File (Disk Storage)
  ========================================================== */

  async uploadFile(filePath, folder = "documents", options = {}) {
    try {
      if (!filePath) {
        throw new Error("No file path provided");
      }

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: `aurevian/${folder}`,
        resource_type: "auto",
        ...options,
      });

      console.log(`✅ Uploaded: ${result.public_id}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        assetId: result.asset_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error("❌ Cloudinary Upload Error:", error.message);

      return {
        success: false,
        error: error.message,
      };
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑 Deleted temp file: ${filePath}`);
        } catch (err) {
          console.error("Failed to delete temp file:", err.message);
        }
      }
    }
  }

  /* ==========================================================
     Delete Single File
  ========================================================== */

  async deleteFile(publicId) {
    try {
      if (!publicId) {
        throw new Error("No publicId provided");
      }

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        console.log(`✅ Deleted: ${publicId}`);

        return {
          success: true,
          result,
        };
      }

      return {
        success: false,
        result,
        error: result.result,
      };
    } catch (error) {
      console.error("❌ Delete Error:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /* ==========================================================
     Delete Multiple Files
  ========================================================== */

  async deleteMultipleFiles(publicIds) {
    try {
      if (!Array.isArray(publicIds) || publicIds.length === 0) {
        throw new Error("No publicIds provided");
      }

      const results = await Promise.all(
        publicIds.map((id) => this.deleteFile(id)),
      );

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error("❌ Delete Multiple Error:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /* ==========================================================
     Optimized URL
  ========================================================== */

  getOptimizedUrl(publicId, options = {}) {
    if (!publicId) return null;

    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      ...options,
    });
  }

  /* ==========================================================
     Thumbnail URL
  ========================================================== */

  getThumbnailUrl(publicId, width = 200, height = 200) {
    if (!publicId) return null;

    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      width,
      height,
      crop: "fill",
      gravity: "auto",
    });
  }

  /* ==========================================================
     Custom Transformation URL
  ========================================================== */

  getTransformedUrl(publicId, transformations = {}) {
    if (!publicId) return null;

    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      ...transformations,
    });
  }

  /* ==========================================================
     Extract Public ID
  ========================================================== */

  extractPublicId(url) {
    if (!url) return null;

    try {
      const uploadIndex = url.indexOf("upload/");

      if (uploadIndex === -1) return null;

      let path = url.substring(uploadIndex + 7);

      const versionMatch = path.match(/^v\d+\//);

      if (versionMatch) {
        path = path.substring(versionMatch[0].length);
      }

      const extensionIndex = path.lastIndexOf(".");

      if (extensionIndex !== -1) {
        path = path.substring(0, extensionIndex);
      }

      return path;
    } catch (error) {
      console.error("Extract Public ID Error:", error);

      return null;
    }
  }
}

export default new CloudinaryService();
