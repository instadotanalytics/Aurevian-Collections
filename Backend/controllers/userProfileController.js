// Backend/controllers/userProfileController.js

import User from "../models/User.js";
import Order from "../models/Order.js";
import cloudinaryService from "../services/cloudinaryService.js";
import fs from "fs";

const PHONE_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

// ============================================
// 1. GET - Get own profile
// ============================================
export const getUserProfile = async (req, res) => {
  try {
    // req.user is already fetched (minus sensitive fields) by protect middleware
    const userProfile = req.user.toObject();
    userProfile.avatar =
      userProfile.avatar?.url || userProfile.profileImage?.url || null;
    userProfile.profileImage =
      userProfile.profileImage?.url || userProfile.avatar || null;

    res.status(200).json({ success: true, userProfile });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching profile",
        error: error.message,
      });
  }
};

// ============================================
// 2. PUT - Update own profile
// ============================================
export const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, gender, dateOfBirth, address } =
      req.body;

    const errors = {};
    if (firstName !== undefined && !firstName.trim())
      errors.firstName = "First name is required";
    if (lastName !== undefined && !lastName.trim())
      errors.lastName = "Last name is required";
    if (phone && !PHONE_REGEX.test(phone))
      errors.phone = "Phone must be 10 digits";
    if (dateOfBirth) {
      const age =
        (Date.now() - new Date(dateOfBirth).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000);
      if (age < 13) errors.dateOfBirth = "Must be at least 13 years old";
    }
    if (Object.keys(errors).length) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed", errors });
    }

    const updateData = { firstName, lastName, phone, gender: gender || "" };
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (address) {
      updateData.address = {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "India",
      };
    }
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k],
    );

    const userProfile = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -refreshTokens -__v -otp -loginHistory -notifications");

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        userProfile,
      });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating profile",
        error: error.message,
      });
  }
};

// ============================================
// 3. POST - Upload avatar
// ============================================
export const uploadProfileAvatar = async (req, res) => {
  try {
    const file = req.files?.avatar?.[0] || req.files?.profileImage?.[0];
    if (!file) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            'Please upload an image. Field name should be "avatar" or "profileImage"',
        });
    }

    const user = req.user;
    const currentAvatar = user.avatar?.url || user.profileImage?.url;
    if (currentAvatar) {
      try {
        const publicId = cloudinaryService.extractPublicId(currentAvatar);
        if (publicId) await cloudinaryService.deleteFile(publicId);
      } catch (err) {
        console.error("❌ Error deleting old avatar:", err);
      }
    }

    const fileBuffer = fs.readFileSync(file.path);
    const uploadResult = await cloudinaryService.uploadBuffer(
      fileBuffer,
      "avatars",
      {
        width: 500,
        height: 500,
        crop: "fill",
        quality: "auto",
      },
    );

    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    if (!uploadResult.success) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to upload avatar",
          error: uploadResult.error,
        });
    }

    const imageData = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    };
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: imageData, profileImage: imageData } },
      { new: true },
    ).select("-password -refreshTokens -__v -otp -loginHistory -notifications");

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar: updatedUser.avatar?.url,
      userProfile: updatedUser,
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("❌ Error uploading avatar:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error uploading avatar",
        error: error.message,
      });
  }
};

// ============================================
// 4. DELETE - Delete avatar
// ============================================
export const deleteProfileAvatar = async (req, res) => {
  try {
    const currentAvatar = req.user.avatar?.url || req.user.profileImage?.url;
    if (!currentAvatar) {
      return res
        .status(400)
        .json({ success: false, message: "No avatar to delete" });
    }

    try {
      const publicId = cloudinaryService.extractPublicId(currentAvatar);
      if (publicId) await cloudinaryService.deleteFile(publicId);
    } catch (err) {
      console.error("❌ Error deleting avatar from Cloudinary:", err);
    }

    const nullImage = { url: null, publicId: null };
    await User.findByIdAndUpdate(req.user._id, {
      $set: { avatar: nullImage, profileImage: nullImage },
    });

    res
      .status(200)
      .json({ success: true, message: "Avatar deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting avatar:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting avatar",
        error: error.message,
      });
  }
};

// ============================================
// 5. DELETE - Delete own account
// ============================================
export const deleteUserAccount = async (req, res) => {
  try {
    const currentAvatar = req.user.avatar?.url || req.user.profileImage?.url;
    if (currentAvatar) {
      try {
        const publicId = cloudinaryService.extractPublicId(currentAvatar);
        if (publicId) await cloudinaryService.deleteFile(publicId);
      } catch (err) {
        console.error("❌ Error deleting avatar from Cloudinary:", err);
      }
    }
    await User.findByIdAndDelete(req.user._id);
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting account",
        error: error.message,
      });
  }
};

// ============================================
// 6. GET - Own orders
// ============================================
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
  }
};

// ============================================
// 7. GET - Own wishlist
// ============================================
export const getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name price images description ratings",
    );
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error("❌ Error fetching wishlist:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching wishlist",
        error: error.message,
      });
  }
};

// ============================================
// Helper: validate + map incoming address body (AddressTab field names)
// to schema field names (Backend/models/User.js addressSchema)
// ============================================
const mapAddressBody = (body) => {
  const errors = {};
  if (!body.recipientName?.trim())
    errors.recipientName = "Recipient name is required";
  if (!body.mobileNumber) errors.mobileNumber = "Mobile number is required";
  else if (!PHONE_REGEX.test(body.mobileNumber))
    errors.mobileNumber = "Mobile number must be 10 digits";
  if (body.alternateMobile && !PHONE_REGEX.test(body.alternateMobile))
    errors.alternateMobile = "Alternate mobile must be 10 digits";
  if (!body.houseNumber?.trim())
    errors.houseNumber = "House number is required";
  if (!body.street?.trim()) errors.street = "Street is required";
  if (!body.area?.trim()) errors.area = "Area is required";
  if (!body.city?.trim()) errors.city = "City is required";
  if (!body.state?.trim()) errors.state = "State is required";
  if (!body.pincode) errors.pincode = "PIN code is required";
  else if (!PINCODE_REGEX.test(body.pincode))
    errors.pincode = "PIN code must be 6 digits";

  const mapped = {
    recipientName: body.recipientName,
    phone: body.mobileNumber,
    alternatePhone: body.alternateMobile || "",
    addressType: body.addressType || "Home",
    house: body.houseNumber,
    apartment: body.apartment || "",
    street: body.street,
    landmark: body.landmark || "",
    area: body.area,
    city: body.city,
    state: body.state,
    country: body.country || "India",
    pincode: body.pincode,
    deliveryInstructions: body.deliveryInstructions || "",
    isDefault: !!body.isDefault,
  };

  return { errors, mapped };
};

// ============================================
// 8. POST - Add address
// ============================================
export const addUserAddress = async (req, res) => {
  try {
    const MAX_ADDRESSES = 10;
    const user = await User.findById(req.user._id).select(
      "-password -refreshTokens -__v -otp -loginHistory -notifications",
    );
    if (user.addresses.length >= MAX_ADDRESSES) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Maximum ${MAX_ADDRESSES} addresses allowed`,
        });
    }

    const { errors, mapped } = mapAddressBody(req.body);
    if (Object.keys(errors).length) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed", errors });
    }

    if (mapped.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
      mapped.isDefault = true;
    }

    user.addresses.push(mapped);
    await user.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Address added successfully",
        userProfile: user,
        addresses: user.addresses,
      });
  } catch (error) {
    console.error("❌ Error adding address:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error adding address",
        error: error.message,
      });
  }
};

// ============================================
// 9. PUT - Update address
// ============================================
export const updateUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id).select(
      "-password -refreshTokens -__v -otp -loginHistory -notifications",
    );
    const address = user.addresses.id(addressId);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // Partial update (e.g. just isDefault) skips full validation
    const isPartialDefaultUpdate =
      Object.keys(req.body).length === 1 && "isDefault" in req.body;

    if (!isPartialDefaultUpdate) {
      const { errors, mapped } = mapAddressBody({
        ...address.toObject(),
        ...req.body,
        houseNumber: req.body.houseNumber ?? address.house,
        mobileNumber: req.body.mobileNumber ?? address.phone,
        alternateMobile: req.body.alternateMobile ?? address.alternatePhone,
      });
      if (Object.keys(errors).length) {
        return res
          .status(400)
          .json({ success: false, message: "Validation failed", errors });
      }
      Object.assign(address, mapped);
    }

    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }

    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Address updated successfully",
        userProfile: user,
        addresses: user.addresses,
      });
  } catch (error) {
    console.error("❌ Error updating address:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating address",
        error: error.message,
      });
  }
};

// ============================================
// 10. DELETE - Delete address
// ============================================
export const deleteUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id).select(
      "-password -refreshTokens -__v -otp -loginHistory -notifications",
    );
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== addressId,
    );

    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Address deleted successfully",
        userProfile: user,
        addresses: user.addresses,
      });
  } catch (error) {
    console.error("❌ Error deleting address:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting address",
        error: error.message,
      });
  }
};

// ============================================
// 11. PUT - Update preferences
// ============================================
export const updateUserPreferences = async (req, res) => {
  try {
    const allowed = [
      "emailNotifications",
      "orderUpdates",
      "promotionalEmails",
      "darkMode",
      "twoFactorAuth",
      "newsletter",
      "notifications",
      "language",
      "currency",
    ];
    const $set = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined)
        $set[`preferences.${key}`] = req.body[key];
    });

    const userProfile = await User.findByIdAndUpdate(
      req.user._id,
      { $set },
      { new: true, runValidators: true },
    ).select("-password -refreshTokens -__v -otp -loginHistory -notifications");

    res
      .status(200)
      .json({
        success: true,
        message: "Preferences updated successfully",
        preferences: userProfile.preferences,
        userProfile,
      });
  } catch (error) {
    console.error("❌ Error updating preferences:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating preferences",
        error: error.message,
      });
  }
};

// ============================================
// 12. PUT - Change password
// ============================================
export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide current and new password",
        });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password must be at least 8 characters",
        });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user.password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No password set for this account. Use forgot password.",
        });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error changing password",
        error: error.message,
      });
  }
};
