// Backend/routes/contactRoutes.js
import express from "express";
import { submitContact } from "../controllers/contactController.js";

const router = express.Router();

// Public — anyone visiting the Contact page can submit this
router.post("/submit", submitContact);

export default router;