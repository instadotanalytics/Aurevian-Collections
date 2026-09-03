// Backend/models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    // Simple contact-page inbox workflow
    status: {
      type: String,
      enum: ["new", "read", "responded", "closed"],
      default: "new",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    // Soft delete — keep records for audit instead of hard-deleting
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

export default mongoose.model("Contact", contactSchema);