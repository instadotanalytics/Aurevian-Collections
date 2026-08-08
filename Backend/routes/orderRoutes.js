// backend/routes/orderRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { protectSeller } from "../middleware/sellerAuth.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/razorpay/create", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.get("/my", protect, getMyOrders);

router.get("/seller/all", protectSeller, getSellerOrders);
router.patch("/seller/:id/status", protectSeller, updateOrderStatus);

router.get("/:id", protect, getOrderById);

export default router;
