// backend/routes/supportRoutes.js

import express from "express";
import {
  createTicket,
  getUserTickets,
  getTicketById,
  getAllTickets,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
  getTicketStats,
} from "../controllers/supportController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTE (Without Authentication)
// ============================================
// User can create ticket without login
router.post("/create", createTicket);

// ============================================
// USER ROUTES (Authenticated)
// ============================================
router.get("/my-tickets", protect, getUserTickets);
router.get("/my-tickets/:id", protect, getTicketById);

// ============================================
// ADMIN ROUTES (Authenticated + Admin)
// ============================================
router.get("/admin/all", protect, admin, getAllTickets);
router.get("/admin/stats", protect, admin, getTicketStats);
router.get("/admin/:id", protect, admin, getTicketById);
router.post("/admin/:id/reply", protect, admin, replyToTicket);
router.put("/admin/:id/status", protect, admin, updateTicketStatus);
router.delete("/admin/:id", protect, admin, deleteTicket);
// backend/routes/supportRoutes.js

// ✅ ADD THIS DEBUG ROUTE
router.get("/admin/debug", protect, admin, (req, res) => {
  res.json({
    success: true,
    message: "Admin access working!",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;