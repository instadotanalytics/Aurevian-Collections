// backend/routes/paymentSettingsRoutes.js
import express from "express";
import { protect, admin } from "../middleware/auth.js";
import {
  getPaymentSettings,
  updatePaymentSettings,
} from "../controllers/paymentSettingsController.js";

const router = express.Router();

router.get("/", getPaymentSettings);
router.patch("/", protect, admin, updatePaymentSettings);

export default router;
