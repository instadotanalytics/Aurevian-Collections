// backend/controllers/supportController.js

import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";
import SuperAdmin from "../models/SuperAdmin.js"; // ✅ Import SuperAdmin
import {
  sendAutoReply,
  sendReplyEmail,
  sendResolvedEmail,
  sendClosedEmail,
  sendAdminNotification,
} from "../services/supportEmailService.js";

// ============================================
// CREATE NEW TICKET
// ============================================
export const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;
    const userId = req.user?.id || null;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const ticket = new SupportTicket({
      name,
      email,
      subject,
      message,
      userId: userId,
      category: category || "general",
      status: "pending",
      priority: "medium",
    });

    await ticket.save();

    await sendAutoReply(name, email, subject, ticket._id);

    try {
      const adminUsers = await User.find({
        role: { $in: ["admin", "super_admin"] },
        isActive: true,
      });

      for (const admin of adminUsers) {
        await sendAdminNotification(
          admin.email,
          ticket._id,
          ticket.name,
          ticket.subject
        );
      }
    } catch (adminError) {
      console.error("Error sending admin notification:", adminError);
    }

    return res.status(201).json({
      success: true,
      data: {
        ticket: {
          id: ticket._id,
          subject: ticket.subject,
          status: ticket.status,
          createdAt: ticket.createdAt,
        },
        message: "Ticket created successfully. We'll get back to you within 24 hours.",
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating support ticket",
      error: error.message,
    });
  }
};

// ============================================
// GET USER TICKETS
// ============================================
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      userId: userId,
      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-replies -__v");

    const total = await SupportTicket.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting user tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting tickets",
    });
  }
};

// ============================================
// GET TICKET BY ID
// ============================================
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";

    const ticket = await SupportTicket.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (!isAdmin && ticket.userId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this ticket",
      });
    }

    if (!isAdmin) {
      ticket.replies.forEach((reply) => {
        if (!reply.isRead) {
          reply.isRead = true;
        }
      });
      await ticket.save();
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error getting ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting ticket",
    });
  }
};

// ============================================
// ADMIN: GET ALL TICKETS
// ============================================
export const getAllTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const query = {
      isDeleted: false,
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await SupportTicket.find(query)
      .sort({
        priority: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "firstName lastName email")
      .populate("replies.adminId", "firstName lastName email");

    const total = await SupportTicket.countDocuments(query);

    const stats = {
      total: await SupportTicket.countDocuments({ isDeleted: false }),
      pending: await SupportTicket.countDocuments({ status: "pending", isDeleted: false }),
      inProgress: await SupportTicket.countDocuments({ status: "in-progress", isDeleted: false }),
      resolved: await SupportTicket.countDocuments({ status: "resolved", isDeleted: false }),
      closed: await SupportTicket.countDocuments({ status: "closed", isDeleted: false }),
      urgent: await SupportTicket.countDocuments({ priority: "urgent", isDeleted: false }),
    };

    return res.status(200).json({
      success: true,
      data: {
        tickets,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting all tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting tickets",
    });
  }
};

// ============================================
// ✅ ADMIN: REPLY TO TICKET - FIXED
// ============================================
export const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;
    
    // ✅ FIX: Use _id instead of id
    const adminId = req.user._id || req.user.id;
    
    console.log("📌 Replying to ticket:", id);
    console.log("📌 Admin ID:", adminId);

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID not found",
      });
    }

    const ticket = await SupportTicket.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Get admin details - Check both User and SuperAdmin models
    let admin = await User.findById(adminId);
    if (!admin) {
      admin = await SuperAdmin.findById(adminId);
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Add reply
    ticket.replies.push({
      adminId: adminId,
      adminName: admin.fullName || `${admin.firstName} ${admin.lastName}`,
      adminEmail: admin.email,
      message: message,
      isInternal: false,
      createdAt: new Date(),
      isRead: false,
    });

    ticket.lastReplyAt = new Date();

    if (status) {
      ticket.status = status;
      if (status === "resolved") {
        ticket.resolvedAt = new Date();
      }
      if (status === "closed") {
        ticket.closedAt = new Date();
      }
    }

    await ticket.save();

    // Send email notification
    try {
      await sendReplyEmail(
        ticket.email,
        ticket.name,
        ticket._id,
        ticket.subject,
        message
      );
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    return res.status(200).json({
      success: true,
      data: ticket,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error replying to ticket",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN: UPDATE TICKET STATUS
// ============================================
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "in-progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const ticket = await SupportTicket.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.status = status;

    if (status === "resolved") {
      ticket.resolvedAt = new Date();
      await sendResolvedEmail(
        ticket.email,
        ticket.name,
        ticket._id,
        ticket.subject
      );
    }

    if (status === "closed") {
      ticket.closedAt = new Date();
      await sendClosedEmail(
        ticket.email,
        ticket.name,
        ticket._id,
        ticket.subject
      );
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      data: ticket,
      message: `Ticket status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating ticket status",
    });
  }
};

// ============================================
// ADMIN: DELETE TICKET
// ============================================
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.isDeleted = true;
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting ticket",
    });
  }
};

// ============================================
// ADMIN: GET TICKET STATS
// ============================================
export const getTicketStats = async (req, res) => {
  try {
    const stats = {
      total: await SupportTicket.countDocuments({ isDeleted: false }),
      pending: await SupportTicket.countDocuments({ status: "pending", isDeleted: false }),
      inProgress: await SupportTicket.countDocuments({ status: "in-progress", isDeleted: false }),
      resolved: await SupportTicket.countDocuments({ status: "resolved", isDeleted: false }),
      closed: await SupportTicket.countDocuments({ status: "closed", isDeleted: false }),
      urgent: await SupportTicket.countDocuments({ priority: "urgent", isDeleted: false }),
      high: await SupportTicket.countDocuments({ priority: "high", isDeleted: false }),
      medium: await SupportTicket.countDocuments({ priority: "medium", isDeleted: false }),
      low: await SupportTicket.countDocuments({ priority: "low", isDeleted: false }),
    };

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await SupportTicket.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
        isDeleted: false,
      });

      last7Days.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        stats,
        last7Days,
      },
    });
  } catch (error) {
    console.error("Error getting ticket stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting stats",
    });
  }
};