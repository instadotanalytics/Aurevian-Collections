// backend/controllers/referralController.js

import ReferralCode from "../models/ReferralCode.js";
import Wallet from "../models/Wallet.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// ============================================
// GET USER'S REFERRAL CODE
// ============================================
export const getMyReferralCode = async (req, res) => {
  try {
    const userId = req.user.id;

    const referralCode = await ReferralCode.findOne({ 
      referrerId: userId,
      isDeleted: false 
    });

    if (!referralCode) {
      return res.status(404).json({
        success: false,
        message: "No referral code found. Generate one now.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        code: referralCode.code,
        discountType: referralCode.discountType,
        discountValue: referralCode.discountValue,
        referrerReward: referralCode.referrerReward,
        minCartValue: referralCode.minCartValue,
        expiryDate: referralCode.expiryDate,
        totalUses: referralCode.totalUses,
        isActive: referralCode.isActive,
      },
    });
  } catch (error) {
    console.error("Error getting referral code:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting referral code",
    });
  }
};

// ============================================
// GENERATE REFERRAL CODE
// ============================================
export const generateReferralCode = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already has a referral code
    const existingCode = await ReferralCode.findOne({ 
      referrerId: userId,
      isDeleted: false 
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "You already have a referral code",
        data: { code: existingCode.code },
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate unique code
    const namePrefix = (user.firstName || user.fullName || "USER")
      .substring(0, 3)
      .toUpperCase();
    
    let code = "";
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      code = `${namePrefix}${randomNum}`;
      
      const existing = await ReferralCode.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      const timestamp = Date.now().toString().slice(-6);
      code = `${namePrefix}${timestamp}`;
    }

    // Create referral code
    const referralCode = new ReferralCode({
      code: code,
      referrerId: userId,
      discountType: "percentage",
      discountValue: 10,
      maxDiscount: 500,
      referrerReward: 50,
      minCartValue: 500,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxUsesPerUser: 1,
      isActive: true,
    });

    await referralCode.save();

    return res.status(201).json({
      success: true,
      data: {
        code: referralCode.code,
        discountType: referralCode.discountType,
        discountValue: referralCode.discountValue,
        referrerReward: referralCode.referrerReward,
        minCartValue: referralCode.minCartValue,
        expiryDate: referralCode.expiryDate,
      },
      message: "Referral code generated successfully!",
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating referral code",
    });
  }
};

// ============================================
// GET REFERRAL STATS
// ============================================
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const referralCode = await ReferralCode.findOne({ 
      referrerId: userId,
      isDeleted: false 
    });

    if (!referralCode) {
      return res.status(200).json({
        success: true,
        data: {
          totalReferrals: 0,
          rewardsEarned: 0,
          pendingRewards: 0,
        },
      });
    }

    const completedReferrals = referralCode.usedBy || [];
    const wallet = await Wallet.findOne({ userId });
    
    let rewardsEarned = 0;
    let pendingRewards = 0;
    
    if (wallet) {
      const completedTransactions = wallet.transactions.filter(
        (t) => t.reference === "referral" && t.status === "completed"
      );
      rewardsEarned = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const pendingTransactions = wallet.transactions.filter(
        (t) => t.reference === "referral" && t.status === "pending"
      );
      pendingRewards = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    }

    return res.status(200).json({
      success: true,
      data: {
        totalReferrals: completedReferrals.length,
        rewardsEarned: rewardsEarned,
        pendingRewards: pendingRewards,
        totalUses: referralCode.totalUses || 0,
      },
    });
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting referral stats",
    });
  }
};

// ============================================
// VALIDATE REFERRAL CODE
// ============================================
export const validateReferralCode = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const userId = req.user.id;

    const referralCode = await ReferralCode.findOne({ 
      code: code.toUpperCase(),
      isDeleted: false 
    });

    if (!referralCode) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code",
      });
    }

    // Check if user is the referrer
    if (referralCode.referrerId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot use your own referral code",
      });
    }

    // Check if code is active
    if (!referralCode.isActive) {
      return res.status(400).json({
        success: false,
        message: "This referral code is inactive",
      });
    }

    // Check expiry
    if (new Date() > referralCode.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "This referral code has expired",
      });
    }

    // Check if user already used this code
    const userUsed = referralCode.usedBy.some(
      (entry) => entry.userId.toString() === userId
    );
    if (userUsed) {
      return res.status(400).json({
        success: false,
        message: "You have already used this referral code",
      });
    }

    // Check max uses
    if (referralCode.maxUses && referralCode.totalUses >= referralCode.maxUses) {
      return res.status(400).json({
        success: false,
        message: "This referral code has reached its maximum uses",
      });
    }

    // Check cart total
    if (cartTotal < referralCode.minCartValue) {
      return res.status(400).json({
        success: false,
        message: `Referral code requires a minimum order of ₹${referralCode.minCartValue}`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (referralCode.discountType === "percentage") {
      discountAmount = (cartTotal * referralCode.discountValue) / 100;
    } else {
      discountAmount = referralCode.discountValue;
    }

    if (referralCode.maxDiscount && discountAmount > referralCode.maxDiscount) {
      discountAmount = referralCode.maxDiscount;
    }

    return res.status(200).json({
      success: true,
      data: {
        code: referralCode.code,
        discountType: referralCode.discountType,
        discountValue: referralCode.discountValue,
        maxDiscount: referralCode.maxDiscount,
        minCartValue: referralCode.minCartValue,
        referrerReward: referralCode.referrerReward,
        discountAmount: discountAmount,
      },
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    return res.status(500).json({
      success: false,
      message: "Error validating referral code",
    });
  }
};

// ============================================
// APPLY REFERRAL TO ORDER
// ============================================
export const applyReferralToOrder = async (req, res) => {
  try {
    const { code, orderId, orderTotal } = req.body;
    const userId = req.user.id;

    const referralCode = await ReferralCode.findOne({ 
      code: code.toUpperCase(),
      isDeleted: false 
    });

    if (!referralCode) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code",
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (referralCode.discountType === "percentage") {
      discountAmount = (orderTotal * referralCode.discountValue) / 100;
    } else {
      discountAmount = referralCode.discountValue;
    }

    if (referralCode.maxDiscount && discountAmount > referralCode.maxDiscount) {
      discountAmount = referralCode.maxDiscount;
    }

    // Add to usedBy
    referralCode.usedBy.push({
      userId: userId,
      orderId: orderId,
      usedAt: new Date(),
      discountAmount: discountAmount,
    });

    referralCode.totalUses += 1;
    await referralCode.save();

    // Create wallet transaction for referrer (pending)
    let wallet = await Wallet.findOne({ userId: referralCode.referrerId });
    if (!wallet) {
      wallet = new Wallet({
        userId: referralCode.referrerId,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        transactions: [],
      });
      await wallet.save();
    }

    await wallet.addTransaction({
      type: "credit",
      amount: referralCode.referrerReward,
      description: `Referral reward from order #${orderId}`,
      reference: "referral",
      referenceId: orderId,
      orderId: orderId,
      status: "pending",
      metadata: {
        referralCode: referralCode.code,
        referredUser: userId,
        orderTotal: orderTotal,
        discountAmount: discountAmount,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        discountAmount: discountAmount,
        referrerReward: referralCode.referrerReward,
        applied: true,
      },
    });
  } catch (error) {
    console.error("Error applying referral:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Error applying referral code",
    });
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================
export const createReferralCode = async (req, res) => {
  try {
    const {
      code,
      referrerId,
      discountType,
      discountValue,
      maxDiscount,
      referrerReward,
      minCartValue,
      expiryDate,
      maxUses,
      maxUsesPerUser,
    } = req.body;

    const existingCode = await ReferralCode.findOne({ 
      code: code.toUpperCase(),
      isDeleted: false 
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Referral code already exists",
      });
    }

    const referralCode = new ReferralCode({
      code: code.toUpperCase(),
      referrerId,
      discountType: discountType || "percentage",
      discountValue: discountValue || 10,
      maxDiscount: maxDiscount || null,
      referrerReward: referrerReward || 50,
      minCartValue: minCartValue || 500,
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxUses: maxUses || null,
      maxUsesPerUser: maxUsesPerUser || 1,
      isActive: true,
    });

    await referralCode.save();

    return res.status(201).json({
      success: true,
      data: referralCode,
      message: "Referral code created successfully",
    });
  } catch (error) {
    console.error("Error creating referral code:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating referral code",
    });
  }
};

export const getReferralCodes = async (req, res) => {
  try {
    const referralCodes = await ReferralCode.find({ isDeleted: false })
      .populate("referrerId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: referralCodes,
    });
  } catch (error) {
    console.error("Error getting referral codes:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting referral codes",
    });
  }
};

export const updateReferralCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const referralCode = await ReferralCode.findById(id);
    if (!referralCode || referralCode.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Referral code not found",
      });
    }

    Object.assign(referralCode, updates);
    referralCode.updatedAt = new Date();
    await referralCode.save();

    return res.status(200).json({
      success: true,
      data: referralCode,
      message: "Referral code updated successfully",
    });
  } catch (error) {
    console.error("Error updating referral code:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating referral code",
    });
  }
};

export const deleteReferralCode = async (req, res) => {
  try {
    const { id } = req.params;

    const referralCode = await ReferralCode.findById(id);
    if (!referralCode) {
      return res.status(404).json({
        success: false,
        message: "Referral code not found",
      });
    }

    referralCode.isDeleted = true;
    referralCode.isActive = false;
    await referralCode.save();

    return res.status(200).json({
      success: true,
      message: "Referral code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting referral code:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting referral code",
    });
  }
};