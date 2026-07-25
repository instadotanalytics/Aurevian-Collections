// backend/routes/headerConfigRoutes.js

import express from "express";
import {
  getPublicHeaderConfig,
  getHeaderConfigAdmin,
  updateHeaderConfigAdmin,
} from "../controllers/headerConfigController.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";

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

export default router;