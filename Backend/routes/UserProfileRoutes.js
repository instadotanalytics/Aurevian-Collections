// Backend/routes/userProfileRoutes.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/auth.js";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
  deleteProfileAvatar,
  deleteUserAccount,
  getUserOrders,
  getUserWishlist,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateUserPreferences,
  changeUserPassword,
} from "../controllers/userProfileController.js";

const router = express.Router();

// ============================================
// MULTER CONFIGURATION FOR AVATAR UPLOADS
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/avatars";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || "unknown";
    cb(
      null,
      `avatar-${userId}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

const handleMulterError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

const uploadAvatar = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
]);

// ============================================
// ALL ROUTES ARE PROTECTED (self only — req.user from JWT)
// ============================================
router.use(protect);

// ============================================
// STRIPPED REDUNDANT /user-profile PREFIX
// (Now mounted at /api/user-profile in server.js)
// ============================================
router.get("/me", getUserProfile);
router.put("/", updateUserProfile);

router.post("/avatar", uploadAvatar, handleMulterError, uploadProfileAvatar);
router.delete("/avatar", deleteProfileAvatar);

router.delete("/", deleteUserAccount);

router.get("/orders", getUserOrders);
router.get("/wishlist", getUserWishlist);

router.post("/addresses", addUserAddress);
router.put("/addresses/:addressId", updateUserAddress);
router.delete("/addresses/:addressId", deleteUserAddress);

router.put("/preferences", updateUserPreferences);
router.put("/change-password", changeUserPassword);

export default router;
