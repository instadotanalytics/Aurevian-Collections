// Backend/controllers/contactController.js
import Contact from "../models/Contact.js";

// ============================================
// PUBLIC — SUBMIT CONTACT FORM
// (Contact.jsx "Send Us a Message" form)
// ============================================
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      return res
        .status(400)
        .json({ success: false, message: "A valid email is required" });
    }
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out. We'll get back to you soon.",
      data: { id: contact._id },
    });
  } catch (error) {
    console.error("❌ Submit contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit your message",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — GET ALL CONTACT MESSAGES
// ============================================
export const getAllContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = { isDeleted: false };
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Contact.countDocuments(query),
    ]);

    const stats = {
      total: await Contact.countDocuments({ isDeleted: false }),
      new: await Contact.countDocuments({ isDeleted: false, status: "new" }),
      read: await Contact.countDocuments({ isDeleted: false, status: "read" }),
      responded: await Contact.countDocuments({
        isDeleted: false,
        status: "responded",
      }),
      closed: await Contact.countDocuments({
        isDeleted: false,
        status: "closed",
      }),
    };

    return res.status(200).json({
      success: true,
      data: contacts,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get all contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — GET SINGLE CONTACT MESSAGE
// (auto-marks "new" as "read" on first open)
// ============================================
export const getContactDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact message not found" });
    }

    if (contact.status === "new") {
      contact.status = "read";
      await contact.save();
    }

    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.error("❌ Get contact detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact message",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — UPDATE CONTACT STATUS / NOTES
// ============================================
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const validStatuses = ["new", "read", "responded", "closed"];

    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact message not found" });
    }

    if (status) {
      contact.status = status;
      if (status === "responded") {
        contact.respondedBy = req.admin.id;
        contact.respondedAt = new Date();
      }
    }
    if (typeof adminNotes === "string") {
      contact.adminNotes = adminNotes;
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Contact message updated",
      data: contact,
    });
  } catch (error) {
    console.error("❌ Update contact status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact message",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — DELETE (soft delete) CONTACT MESSAGE
// ============================================
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact message not found" });
    }

    contact.isDeleted = true;
    await contact.save();

    return res
      .status(200)
      .json({ success: true, message: "Contact message deleted" });
  } catch (error) {
    console.error("❌ Delete contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
      error: error.message,
    });
  }
};
