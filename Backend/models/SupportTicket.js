// backend/models/SupportTicket.js

import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [500, "Subject cannot exceed 500 characters"], // ✅ Increased to 500
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    category: {
      type: String,
      enum: [
        "order",
        "payment",
        "product",
        "shipping",
        "return",
        "account",
        "general",
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },
    replies: [
      {
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        adminName: {
          type: String,
        },
        adminEmail: {
          type: String,
        },
        message: {
          type: String,
          required: true,
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
    attachments: [
      {
        url: String,
        name: String,
        size: Number,
        type: String,
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    lastReplyAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
supportTicketSchema.index({ email: 1 });
supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ isDeleted: 1 });

// Virtuals
supportTicketSchema.virtual("isNew").get(function () {
  return this.status === "pending";
});

supportTicketSchema.virtual("hasReplies").get(function () {
  return this.replies && this.replies.length > 0;
});

supportTicketSchema.virtual("replyCount").get(function () {
  return this.replies ? this.replies.length : 0;
});

supportTicketSchema.virtual("age").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Methods
supportTicketSchema.methods.addReply = async function (data) {
  this.replies.push({
    adminId: data.adminId,
    adminName: data.adminName,
    adminEmail: data.adminEmail,
    message: data.message,
    isInternal: data.isInternal || false,
    createdAt: new Date(),
    isRead: false,
  });
  
  this.lastReplyAt = new Date();
  
  if (data.status) {
    this.status = data.status;
    if (data.status === "resolved") {
      this.resolvedAt = new Date();
    }
    if (data.status === "closed") {
      this.closedAt = new Date();
    }
  }
  
  await this.save();
  return this;
};

supportTicketSchema.methods.resolve = async function () {
  this.status = "resolved";
  this.resolvedAt = new Date();
  await this.save();
  return this;
};

supportTicketSchema.methods.close = async function () {
  this.status = "closed";
  this.closedAt = new Date();
  await this.save();
  return this;
};

supportTicketSchema.methods.getUnreadReplies = function () {
  return this.replies.filter((reply) => !reply.isRead);
};

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;