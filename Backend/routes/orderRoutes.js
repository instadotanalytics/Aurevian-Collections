// backend/routes/orderRoutes.js
import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { protectSeller } from "../middleware/sellerAuth.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createCODOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  getAdminOrders,
  getOrderHistory,
  getOrderHistoryDetail,
  updateOrderStatus,
  sellerConfirmOrder,
  sellerRejectOrder,
  adminApproveOrder,
  adminRejectOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/razorpay/create", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.post("/cod/create", protect, createCODOrder);
router.get("/my", protect, getMyOrders);

router.get("/seller/all", protectSeller, getSellerOrders);
router.patch("/seller/:id/status", protectSeller, updateOrderStatus);
router.post("/:orderId/seller-confirm", protectSeller, sellerConfirmOrder);
router.post("/:orderId/seller-reject", protectSeller, sellerRejectOrder);

router.get("/admin/history", protect, admin, getOrderHistory);
router.get("/admin/history/:id", protect, admin, getOrderHistoryDetail);
router.get("/admin/all", protect, admin, getAdminOrders);
router.post("/:orderId/admin-approve", protect, admin, adminApproveOrder);
router.post("/:orderId/admin-reject", protect, admin, adminRejectOrder);

router.get("/:id", protect, getOrderById);

export default router;
