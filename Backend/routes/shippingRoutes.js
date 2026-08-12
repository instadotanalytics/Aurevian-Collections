// backend/routes/shippingRoutes.js
import express from "express";
import { protect, admin } from "../middleware/auth.js";
import {
  checkServiceability,
  getShippingQuote, // ✅ NEW
  createShipment,
  assignAWB,
  schedulePickup,
  generateLabel,
  generateManifest,
  trackShipment,
  cancelShipment,
  createReturn,
  shiprocketWebhook,
  adminListShippingOrders,
} from "../controllers/shippingController.js";

const router = express.Router();

// Public — no order/customer data returned, just courier options.
// If you'd rather gate this behind login, add `protect` here.
router.get("/serviceability", checkServiceability);

// ✅ NEW — live checkout quote. Requires login because it reads the
// customer's own cart from the DB (never trusts client-supplied items).
router.post("/calculate-rate", protect, getShippingQuote);

// Public — secured via SHIPROCKET_WEBHOOK_TOKEN header check inside the controller
router.post("/webhook", shiprocketWebhook);

// Customer or admin (ownership checked inside controllers)
router.post("/create", protect, createShipment);
router.get("/track/:awb", protect, trackShipment);
router.post("/cancel", protect, cancelShipment);

// Admin only
router.post("/assign-awb", protect, admin, assignAWB);
router.post("/pickup", protect, admin, schedulePickup);
router.post("/label", protect, admin, generateLabel);
router.post("/manifest", protect, admin, generateManifest);
router.post("/return", protect, admin, createReturn);
router.get("/admin/orders", protect, admin, adminListShippingOrders);

export default router;
