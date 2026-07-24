// backend/routes/subscriptionRoutes.js

import express from "express";
import {
  getPlans,
  getCurrentSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionHistory,
  cancelSubscription,
} from "../controllers/subscriptionController.js";
import { protectSeller } from "../middleware/sellerAuth.js";

const router = express.Router();

// All subscription routes require a logged-in seller
router.use(protectSeller);

router.get("/plans", getPlans);
router.get("/current", getCurrentSubscription);
router.post("/create-order", createSubscriptionOrder);
router.post("/verify-payment", verifySubscriptionPayment);
router.get("/history", getSubscriptionHistory);
router.post("/cancel", cancelSubscription);

console.log("✅ Subscription routes configured successfully");
console.log("  📌 GET    /api/seller/subscription/plans");
console.log("  📌 GET    /api/seller/subscription/current");
console.log("  📌 POST   /api/seller/subscription/create-order");
console.log("  📌 POST   /api/seller/subscription/verify-payment");
console.log("  📌 GET    /api/seller/subscription/history");
console.log("  📌 POST   /api/seller/subscription/cancel");

export default router;
