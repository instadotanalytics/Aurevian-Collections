// backend/models/Wallet.js

import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    enum: ["referral", "order", "refund", "purchase", "bonus"],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "reference",
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "reversed"],
    default: "pending",
  },
  balance: {
    type: Number,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    transactions: [walletTransactionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.index({ userId: 1 });

walletSchema.methods.addTransaction = async function (data) {
  const transaction = {
    type: data.type,
    amount: data.amount,
    description: data.description,
    reference: data.reference,
    referenceId: data.referenceId,
    orderId: data.orderId || null,
    status: data.status || "completed",
    balance: data.type === "credit" ? this.balance + data.amount : this.balance - data.amount,
    metadata: data.metadata || {},
    createdAt: new Date(),
  };

  this.transactions.push(transaction);

  if (data.type === "credit") {
    this.balance += data.amount;
    this.totalEarned += data.amount;
  } else {
    this.balance -= data.amount;
    this.totalSpent += data.amount;
  }

  this.updatedAt = new Date();
  await this.save();

  return transaction;
};

walletSchema.methods.reverseTransaction = async function (transactionId) {
  const transaction = this.transactions.id(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status === "reversed") {
    throw new Error("Transaction already reversed");
  }

  if (transaction.type === "credit") {
    this.balance -= transaction.amount;
    this.totalEarned -= transaction.amount;
  } else {
    this.balance += transaction.amount;
    this.totalSpent -= transaction.amount;
  }

  transaction.status = "reversed";
  this.updatedAt = new Date();
  await this.save();

  return transaction;
};

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;