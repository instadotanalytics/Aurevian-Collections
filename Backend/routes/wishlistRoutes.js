// backend/routes/wishlistRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();
router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/remove/:productId", removeFromWishlist);

export default router;
