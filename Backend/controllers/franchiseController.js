// Backend/controllers/franchiseController.js
import Franchise from "../models/Franchise.js";

// ============================================
// PUBLIC — SUBMIT FRANCHISE INQUIRY FORM
// (Franchise.jsx "Franchise Inquiry Form")
// ============================================
export const submitFranchise = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      city,
      state,
      budget,
      size,
      experience,
      message,
      agree,
    } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    if (!phone || !/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "A valid 10-digit phone number is required",
      });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res
        .status(400)
        .json({ success: false, message: "A valid email is required" });
    }
    if (!city || !city.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "City is required" });
    }
    if (!state || !state.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "State is required" });
    }
    if (!budget) {
      return res.status(400).json({
        success: false,
        message: "Investment budget is required",
      });
    }
    if (!agree) {
      return res.status(400).json({
        success: false,
        message: "Please accept the terms to continue",
      });
    }

    const franchise = await Franchise.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      city: city.trim(),
      state: state.trim(),
      budget,
      size: size || "",
      experience: experience || "",
      message: message ? message.trim() : "",
      agreedToTerms: !!agree,
    });

    return res.status(201).json({
      success: true,
      message:
        "Your franchise inquiry has been received. Our team will reach out within 48 hours.",
      data: { id: franchise._id },
    });
  } catch (error) {
    console.error("❌ Submit franchise error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit your inquiry",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — GET ALL FRANCHISE ENQUIRIES
// ============================================
export const getAllFranchises = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = { isDeleted: false };
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [franchises, total] = await Promise.all([
      Franchise.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Franchise.countDocuments(query),
    ]);

    const stats = {
      total: await Franchise.countDocuments({ isDeleted: false }),
      new: await Franchise.countDocuments({ isDeleted: false, status: "new" }),
      contacted: await Franchise.countDocuments({
        isDeleted: false,
        status: "contacted",
      }),
      inDiscussion: await Franchise.countDocuments({
        isDeleted: false,
        status: "in-discussion",
      }),
      approved: await Franchise.countDocuments({
        isDeleted: false,
        status: "approved",
      }),
      rejected: await Franchise.countDocuments({
        isDeleted: false,
        status: "rejected",
      }),
    };

    return res.status(200).json({
      success: true,
      data: franchises,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get all franchises error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch franchise enquiries",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — GET SINGLE FRANCHISE ENQUIRY
// ============================================
export const getFranchiseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const franchise = await Franchise.findById(id);

    if (!franchise) {
      return res
        .status(404)
        .json({ success: false, message: "Franchise enquiry not found" });
    }

    return res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    console.error("❌ Get franchise detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch franchise enquiry",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — UPDATE FRANCHISE STATUS / NOTES
// ============================================
export const updateFranchiseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const validStatuses = [
      "new",
      "contacted",
      "in-discussion",
      "approved",
      "rejected",
    ];

    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res
        .status(404)
        .json({ success: false, message: "Franchise enquiry not found" });
    }

    if (status) {
      franchise.status = status;
      if (status === "contacted" && !franchise.contactedAt) {
        franchise.contactedBy = req.admin.id;
        franchise.contactedAt = new Date();
      }
    }
    if (typeof adminNotes === "string") {
      franchise.adminNotes = adminNotes;
    }

    await franchise.save();

    return res.status(200).json({
      success: true,
      message: "Franchise enquiry updated",
      data: franchise,
    });
  } catch (error) {
    console.error("❌ Update franchise status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update franchise enquiry",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — DELETE (soft delete) FRANCHISE ENQUIRY
// ============================================
export const deleteFranchise = async (req, res) => {
  try {
    const { id } = req.params;
    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res
        .status(404)
        .json({ success: false, message: "Franchise enquiry not found" });
    }

    franchise.isDeleted = true;
    await franchise.save();

    return res
      .status(200)
      .json({ success: true, message: "Franchise enquiry deleted" });
  } catch (error) {
    console.error("❌ Delete franchise error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete franchise enquiry",
      error: error.message,
    });
  }
};
