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

router.get("/user-profile/me", getUserProfile);
router.put("/user-profile", updateUserProfile);

router.post(
  "/user-profile/avatar",
  uploadAvatar,
  handleMulterError,
  uploadProfileAvatar,
);
router.delete("/user-profile/avatar", deleteProfileAvatar);

router.delete("/user-profile", deleteUserAccount);

router.get("/user-profile/orders", getUserOrders);
router.get("/user-profile/wishlist", getUserWishlist);

router.post("/user-profile/addresses", addUserAddress);
router.put("/user-profile/addresses/:addressId", updateUserAddress);
router.delete("/user-profile/addresses/:addressId", deleteUserAddress);

router.put("/user-profile/preferences", updateUserPreferences);
router.put("/user-profile/change-password", changeUserPassword);

export default router;
