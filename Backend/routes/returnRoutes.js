// backend/routes/returnRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { protectSeller } from "../middleware/sellerAuth.js";
import {
  createReturnRequest,
  getOrderReturnEligibility,
  getMyReturnRequests,
  cancelReturnRequest,
  getSellerReturnRequests,
  sellerApproveReturn,
  sellerRejectReturn,
  retryReturnShiprocketSync,
  updateReturnStatus,
} from "../controllers/returnController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, png, webp) are allowed"), false);
    }
  },
});

// ============================================
// CUSTOMER ROUTES
// ============================================
router.get("/order/:orderId", protect, getOrderReturnEligibility);
router.get("/my", protect, getMyReturnRequests);
router.post("/", protect, upload.array("images", 5), createReturnRequest);
router.post("/:id/cancel", protect, cancelReturnRequest);

// ============================================
// SELLER ROUTES
// ============================================
router.get("/seller/all", protectSeller, getSellerReturnRequests);
router.post("/:id/seller-approve", protectSeller, sellerApproveReturn);
router.post("/:id/seller-reject", protectSeller, sellerRejectReturn);
router.post(
  "/:id/retry-shiprocket-sync",
  protectSeller,
  retryReturnShiprocketSync,
);
router.patch("/:id/status", protectSeller, updateReturnStatus);

export default router;
