// backend/routes/headerConfigRoutes.js

import express from "express";
import {
  getPublicHeaderConfig,
  getHeaderConfigAdmin,
  updateHeaderConfigAdmin,
  uploadCategoryImage,
} from "../controllers/headerConfigController.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";
import upload, { handleMulterError } from "../middleware/upload.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTE — storefront navbar reads from here
// ============================================
router.get("/active", getPublicHeaderConfig);

// ============================================
// PROTECTED ROUTES (Super Admin only)
// ============================================
router.use(protectSuperAdmin);

router.get("/", getHeaderConfigAdmin);
router.put("/", updateHeaderConfigAdmin);

// Category image upload — used by the Shop by Category editor
router.post(
  "/upload-category-image",
  upload.single("image"),
  handleMulterError,
  uploadCategoryImage,
);

export default router;
