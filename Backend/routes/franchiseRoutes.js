// Backend/routes/franchiseRoutes.js
import express from "express";
import { submitFranchise } from "../controllers/franchiseController.js";

const router = express.Router();

// Public — anyone visiting the Franchise page can submit this
router.post("/submit", submitFranchise);

export default router;