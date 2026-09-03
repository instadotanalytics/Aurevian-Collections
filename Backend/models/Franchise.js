// Backend/models/Franchise.js
import mongoose from "mongoose";

const franchiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    budget: {
      type: String,
      required: [true, "Investment budget is required"],
      trim: true,
    },
    size: {
      type: String,
      trim: true,
      default: "",
    },
    experience: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    agreedToTerms: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Franchise sales pipeline workflow
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "converted",
        "rejected",
        "archived",
      ],
      default: "new",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    contactedAt: {
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

franchiseSchema.index({ status: 1, createdAt: -1 });
franchiseSchema.index({ email: 1 });

export default mongoose.model("Franchise", franchiseSchema);
