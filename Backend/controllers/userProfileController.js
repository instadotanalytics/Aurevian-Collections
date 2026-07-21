// Backend/controllers/userProfileController.js

import User from '../models/User.js';
import UserProfile from '../models/UserProfileModel.js';
import Order from '../models/Order.js';
import cloudinaryService from '../services/cloudinaryService.js';
import fs from 'fs';

// ============================================
// Helper: Get User Profile from both models
// ============================================
const getUserProfileData = async (userId) => {
  // Try to get from UserProfile first
  let userProfile = await UserProfile.findById(userId)
    .select('-password -refreshTokens -__v -loginHistory -notifications')
    .populate('wishlist', 'name price images description ratings');

  // If not found in UserProfile, get from User
  if (!userProfile) {
    userProfile = await User.findById(userId)
      .select('-password -refreshTokens -__v -otp -loginHistory -notifications')
      .populate('wishlist', 'name price images description ratings');
  }

  return userProfile;
};

// ============================================
// 1. GET - Get User Profile by ID
// ============================================
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own user profile'
      });
    }

    const userProfile = await getUserProfileData(userId);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      userProfile
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// ============================================
// 2. PUT - Update User Profile by ID
// ============================================
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own user profile'
      });
    }

    const { firstName, lastName, phone, gender, dateOfBirth, address } = req.body;

    console.log('📝 Updating profile with data:', { firstName, lastName, phone, gender, dateOfBirth, address });

    const updateData = {
      firstName,
      lastName,
      phone,
      gender: gender || '',
    };

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    if (address) {
      updateData.address = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India'
      };
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Try to update UserProfile first
    let userProfile = await UserProfile.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        returnDocument: 'after'
      }
    ).select('-password -refreshTokens -__v -loginHistory -notifications');

    // If not found in UserProfile, update User
    if (!userProfile) {
      userProfile = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { 
          new: true, 
          runValidators: true,
          returnDocument: 'after'
        }
      ).select('-password -refreshTokens -__v -otp -loginHistory -notifications');
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    console.log('✅ Profile updated successfully:', userProfile);

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      userProfile
    });
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

// ============================================
// 3. POST - Upload Profile Photo by ID
// ============================================
export const uploadProfileAvatar = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own user profile avatar'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Get user from both models
    let userProfile = await UserProfile.findById(userId);
    let user = await User.findById(userId);

    if (!userProfile && !user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Delete old avatar from Cloudinary
    const currentAvatar = userProfile?.avatar || user?.avatar;
    if (currentAvatar) {
      try {
        const publicId = currentAvatar.split('/').pop().split('.')[0];
        const fullPublicId = `aurevian/avatars/${publicId}`;
        await cloudinaryService.deleteFile(fullPublicId);
      } catch (error) {
        console.error('❌ Error deleting old avatar:', error);
      }
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const uploadResult = await cloudinaryService.uploadBuffer(
      fileBuffer,
      'avatars',
      {
        width: 500,
        height: 500,
        crop: 'fill',
        quality: 'auto'
      }
    );

    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload avatar to Cloudinary',
        error: uploadResult.error
      });
    }

    // Update both models
    if (userProfile) {
      userProfile.avatar = uploadResult.url;
      userProfile.profileImage = uploadResult.url;
      await userProfile.save();
    }

    if (user) {
      user.avatar = uploadResult.url;
      user.profileImage = uploadResult.url;
      await user.save();
    }

    const updatedProfile = await getUserProfileData(userId);

    res.status(200).json({
      success: true,
      message: 'User profile photo updated successfully',
      avatar: uploadResult.url,
      userProfile: updatedProfile
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    console.error('❌ Error uploading user profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading user profile photo',
      error: error.message
    });
  }
};

// ============================================
// 4. DELETE - Delete Profile Photo by ID
// ============================================
export const deleteProfileAvatar = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own user profile avatar'
      });
    }

    let userProfile = await UserProfile.findById(userId);
    let user = await User.findById(userId);

    if (!userProfile && !user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const currentAvatar = userProfile?.avatar || user?.avatar;
    if (!currentAvatar) {
      return res.status(400).json({
        success: false,
        message: 'No avatar to delete'
      });
    }

    try {
      const publicId = currentAvatar.split('/').pop().split('.')[0];
      const fullPublicId = `aurevian/avatars/${publicId}`;
      await cloudinaryService.deleteFile(fullPublicId);
    } catch (error) {
      console.error('❌ Error deleting avatar from Cloudinary:', error);
    }

    // Update both models
    if (userProfile) {
      userProfile.avatar = null;
      userProfile.profileImage = null;
      await userProfile.save();
    }

    if (user) {
      user.avatar = null;
      user.profileImage = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'User profile photo deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user profile photo',
      error: error.message
    });
  }
};

// ============================================
// 5. DELETE - Delete User Account by ID
// ============================================
export const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own user profile account'
      });
    }

    let userProfile = await UserProfile.findById(userId);
    let user = await User.findById(userId);

    if (!userProfile && !user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const currentAvatar = userProfile?.avatar || user?.avatar;
    if (currentAvatar) {
      try {
        const publicId = currentAvatar.split('/').pop().split('.')[0];
        const fullPublicId = `aurevian/avatars/${publicId}`;
        await cloudinaryService.deleteFile(fullPublicId);
      } catch (error) {
        console.error('❌ Error deleting avatar from Cloudinary:', error);
      }
    }

    // Delete from both models
    if (userProfile) {
      await UserProfile.findByIdAndDelete(userId);
    }
    if (user) {
      await User.findByIdAndDelete(userId);
    }

    res.status(200).json({
      success: true,
      message: 'User profile account deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user profile account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user profile account',
      error: error.message
    });
  }
};

// ============================================
// 6. GET - Get User Orders by ID
// ============================================
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own user profile orders'
      });
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('❌ Error fetching user profile orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile orders',
      error: error.message
    });
  }
};

// ============================================
// 7. GET - Get User Wishlist by ID
// ============================================
export const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own user profile wishlist'
      });
    }

    let userProfile = await UserProfile.findById(userId)
      .populate('wishlist', 'name price images description ratings');

    if (!userProfile) {
      userProfile = await User.findById(userId)
        .populate('wishlist', 'name price images description ratings');
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      wishlist: userProfile.wishlist
    });
  } catch (error) {
    console.error('❌ Error fetching user profile wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile wishlist',
      error: error.message
    });
  }
};

// ============================================
// 8. POST - Add Address by ID
// ============================================
export const addUserAddress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only add addresses to your own user profile'
      });
    }

    const { name, street, city, state, pincode, country, phone, isDefault } = req.body;

    console.log('📝 Adding address:', { name, street, city, state, pincode, country, phone, isDefault });

    if (!name || !street || !city || !state || !pincode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, street, city, state, pincode, phone'
      });
    }

    let userProfile = await UserProfile.findById(userId);
    let user = await User.findById(userId);

    if (!userProfile && !user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const newAddress = {
      name,
      street,
      city,
      state,
      pincode,
      country: country || 'India',
      phone,
      isDefault: isDefault || false
    };

    // Update UserProfile if exists
    if (userProfile) {
      if (!userProfile.addresses) {
        userProfile.addresses = [];
      }

      if (isDefault || userProfile.addresses.length === 0) {
        userProfile.addresses.forEach(addr => addr.isDefault = false);
        newAddress.isDefault = true;
      }

      userProfile.addresses.push(newAddress);
      await userProfile.save();
    }

    // Update User if exists
    if (user) {
      if (!user.addresses) {
        user.addresses = [];
      }

      if (isDefault || user.addresses.length === 0) {
        user.addresses.forEach(addr => addr.isDefault = false);
        newAddress.isDefault = true;
      }

      user.addresses.push(newAddress);
      await user.save();
    }

    console.log('✅ Address added successfully:', newAddress);

    const updatedProfile = await getUserProfileData(userId);

    res.status(201).json({
      success: true,
      message: 'Address added to user profile successfully',
      userProfile: updatedProfile
    });
  } catch (error) {
    console.error('❌ Error adding address to user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding address to user profile',
      error: error.message
    });
  }
};

// ============================================
// 9. PUT - Update Address by ID
// ============================================
export const updateUserAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update addresses on your own user profile'
      });
    }

    const { name, street, city, state, pincode, country, phone, isDefault } = req.body;

    let userProfile = await UserProfile.findById(userId);
    let user = await User.findById(userId);

    if (!userProfile && !user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Update in UserProfile
    if (userProfile && userProfile.addresses) {
      const addressIndex = userProfile.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex !== -1) {
        if (isDefault) {
          userProfile.addresses.forEach(addr => addr.isDefault = false);
        }

        const address = userProfile.addresses[addressIndex];
        if (name) address.name = name;
        if (street) address.street = street;
        if (city) address.city = city;
        if (state) address.state = state;
        if (pincode) address.pincode = pincode;
        if (country) address.country = country;
        if (phone) address.phone = phone;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await userProfile.save();
      }
    }

    // Update in User
    if (user && user.addresses) {
      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex !== -1) {
        if (isDefault) {
          user.addresses.forEach(addr => addr.isDefault = false);
        }

        const address = user.addresses[addressIndex];
        if (name) address.name = name;
        if (street) address.street = street;
        if (city) address.city = city;
        if (state) address.state = state;
        if (pincode) address.pincode = pincode;
        if (country) address.country = country;
        if (phone) address.phone = phone;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();
      }
    }

    const updatedProfile = await getUserProfileData(userId);

    res.status(200).json({
      success: true,
      message: 'Address updated in user profile successfully',
      userProfile: updatedProfile
    });
  } catch (error) {
    console.error('❌ Error updating address in user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address in user profile',
      error: error.message
    });
  }
};

// ============================================
// 10. DELETE - Delete Address by ID
// ============================================
export const deleteUserAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete addresses from your own user profile'
      });
    }

    let userProfile = await UserProfile.findById(userId);
    let user = await User.findById(userId);

    if (!userProfile && !user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Delete from UserProfile
    if (userProfile && userProfile.addresses) {
      userProfile.addresses = userProfile.addresses.filter(
        addr => addr._id.toString() !== addressId
      );

      if (userProfile.addresses.length > 0) {
        const hasDefault = userProfile.addresses.some(addr => addr.isDefault);
        if (!hasDefault) {
          userProfile.addresses[0].isDefault = true;
        }
      }

      await userProfile.save();
    }

    // Delete from User
    if (user && user.addresses) {
      user.addresses = user.addresses.filter(
        addr => addr._id.toString() !== addressId
      );

      if (user.addresses.length > 0) {
        const hasDefault = user.addresses.some(addr => addr.isDefault);
        if (!hasDefault) {
          user.addresses[0].isDefault = true;
        }
      }

      await user.save();
    }

    const updatedProfile = await getUserProfileData(userId);

    res.status(200).json({
      success: true,
      message: 'Address deleted from user profile successfully',
      userProfile: updatedProfile
    });
  } catch (error) {
    console.error('❌ Error deleting address from user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address from user profile',
      error: error.message
    });
  }
};

// ============================================
// 11. PUT - Update User Preferences by ID
// ============================================
export const updateUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own user profile preferences'
      });
    }

    const { emailNotifications, orderUpdates, promotionalEmails, darkMode, twoFactorAuth } = req.body;

    let userProfile = await UserProfile.findByIdAndUpdate(
      userId,
      {
        $set: {
          'preferences.emailNotifications': emailNotifications,
          'preferences.orderUpdates': orderUpdates,
          'preferences.promotionalEmails': promotionalEmails,
          'preferences.darkMode': darkMode,
          'preferences.twoFactorAuth': twoFactorAuth
        }
      },
      { 
        new: true, 
        runValidators: true,
        returnDocument: 'after'
      }
    ).select('-password -refreshTokens -__v -loginHistory -notifications');

    if (!userProfile) {
      userProfile = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.emailNotifications': emailNotifications,
            'preferences.orderUpdates': orderUpdates,
            'preferences.promotionalEmails': promotionalEmails,
            'preferences.darkMode': darkMode,
            'preferences.twoFactorAuth': twoFactorAuth
          }
        },
        { 
          new: true, 
          runValidators: true,
          returnDocument: 'after'
        }
      ).select('-password -refreshTokens -__v -otp -loginHistory -notifications');
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile preferences updated successfully',
      preferences: userProfile.preferences
    });
  } catch (error) {
    console.error('❌ Error updating user profile preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile preferences',
      error: error.message
    });
  }
};

// ============================================
// 12. PUT - Change Password by ID
// ============================================
export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own user profile password'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    let userProfile = await UserProfile.findById(userId).select('+password');
    if (!userProfile) {
      userProfile = await User.findById(userId).select('+password');
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    if (userProfile.password) {
      const isMatch = await userProfile.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No password set for this account. Please use forgot password.'
      });
    }

    userProfile.password = newPassword;
    await userProfile.save();

    res.status(200).json({
      success: true,
      message: 'User profile password changed successfully'
    });
  } catch (error) {
    console.error('❌ Error changing user profile password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing user profile password',
      error: error.message
    });
  }
};