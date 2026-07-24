// backend/utils/orderStatusHandler.js
import { creditReferralReward, reverseReferralReward } from "../controllers/referralController.js";
import Order from "../models/Order.js";

export const handleOrderStatusChange = async (orderId, newStatus, previousStatus) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if order has referral code
    if (!order.referralCode) {
      return { success: false, message: "No referral code associated" };
    }

    // Handle different status transitions
    switch (newStatus) {
      case "delivered":
        // Only credit if previous status was not already delivered
        if (previousStatus !== "delivered") {
          const result = await creditReferralReward(orderId);
          return result;
        }
        break;

      case "cancelled":
      case "refunded":
        // Reverse reward if it was already credited
        const rewardCredited = await checkIfRewardCredited(orderId);
        if (rewardCredited) {
          const result = await reverseReferralReward(orderId);
          return result;
        }
        break;

      default:
        // For other statuses, do nothing
        return { success: false, message: "No action required" };
    }

    return { success: false, message: "No action taken" };
  } catch (error) {
    console.error("Error handling order status change:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Helper function to check if reward was credited
const checkIfRewardCredited = async (orderId) => {
  // This would check the wallet transactions for the order
  // Implementation depends on your database structure
  return false;
};