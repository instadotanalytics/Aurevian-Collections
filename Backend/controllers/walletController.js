// backend/controllers/walletController.js
import Wallet from "../models/Wallet.js";

export const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        transactions: [],
      });
      await wallet.save();
    }

    return res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error("Error getting wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting wallet",
    });
  }
};

export const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      });
    }

    const transactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: wallet.transactions.length,
        pages: Math.ceil(wallet.transactions.length / limit),
      },
    });
  } catch (error) {
    console.error("Error getting wallet transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting wallet transactions",
    });
  }
};