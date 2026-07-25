// backend/routes/subscriptionPlanRoutes.js — full file (added DELETE route)

import express from "express";
import {
  getAllPlansAdmin,
  getPlanByIdAdmin,
  createPlan,
  updatePlan,
  togglePlanStatus,
  updatePlanOrder,
  deletePlan,
} from "../controllers/subscriptionPlanController.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";

const router = express.Router();

router.use(protectSuperAdmin);

router.get("/", getAllPlansAdmin);
router.put("/order", updatePlanOrder);
router.get("/:id", getPlanByIdAdmin);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.patch("/:id/toggle", togglePlanStatus);
router.delete("/:id", deletePlan);

export default router;
