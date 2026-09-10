// Backend/routes/locationRoutes.js

import express from "express";
import {
  getLocationSettingsAdmin,
  updateLocationSettingsAdmin,
  getLocationOverviewAdmin,
  getSellersLocationStatusAdmin,
} from "../controllers/locationSettingsController.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";

const router = express.Router();

// All location-admin endpoints require Super Admin auth.
router.use(protectSuperAdmin);

router.get("/settings", getLocationSettingsAdmin);
router.put("/settings", updateLocationSettingsAdmin);
router.get("/overview", getLocationOverviewAdmin);
router.get("/sellers", getSellersLocationStatusAdmin);

export default router;
