// backend/routes/walletRoutes.js
import express from "express";
import {
  getWallet,
  getWalletTransactions,
} from "../controllers/walletController.js";
// ✅ Fix: Use correct export names from auth.js
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ✅ Use 'protect' instead of 'authenticate'
router.get("/", protect, getWallet);
router.get("/transactions", protect, getWalletTransactions);

export default router;