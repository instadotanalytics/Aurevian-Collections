// Backend/controllers/bannerController.js

import Banner from '../models/Banner.js';
import cloudinaryService from '../services/cloudinaryService.js';

// ============================================
// GET ACTIVE BANNERS (Public) - FIXED
// ============================================
export const getActiveBanners = async (req, res) => {
  try {
    // ✅ Simple query - just get all active banners without date filters
    const banners = await Banner.find({ isActive: true })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .limit(10);

    console.log(`📊 Found ${banners.length} active banners`);

    return res.status(200).json({
      success: true,
      data: banners
    });

  } catch (error) {
    console.error('❌ Get active banners error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active banners',
      error: error.message
    });
  }
};

// ============================================
// CREATE BANNER
// ============================================
export const createBanner = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { title, subtitle, offer, subtext, buttonText, buttonLink, order, isActive, isFeatured, startDate, endDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required'
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinaryService.uploadBuffer(
      req.file.buffer,
      'banners',
      { 
        transformation: [
          { width: 1200, height: 400, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary',
        error: uploadResult.error
      });
    }

    // Get highest order if not provided
    let bannerOrder = order;
    if (bannerOrder === undefined || bannerOrder === null) {
      const maxOrder = await Banner.findOne().sort({ order: -1 }).select('order');
      bannerOrder = maxOrder ? maxOrder.order + 1 : 0;
    }

    // Create banner - ✅ Force isActive to true if not provided
    const banner = new Banner({
      title,
      subtitle: subtitle || '',
      offer: offer || '',
      subtext: subtext || '',
      image: {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      },
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || '/shop',
      order: bannerOrder,
      isActive: isActive !== undefined ? isActive : true, // ✅ Default to true
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      createdBy: adminId
    });

    await banner.save();

    return res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });

  } catch (error) {
    console.error('❌ Create banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message
    });
  }
};

// ============================================
// GET ALL BANNERS (Admin)
// ============================================
export const getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, isFeatured, search } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { offer: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [banners, total] = await Promise.all([
      Banner.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Banner.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: banners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get all banners error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message
    });
  }
};

// ============================================
// GET SINGLE BANNER
// ============================================
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: banner
    });

  } catch (error) {
    console.error('❌ Get banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banner',
      error: error.message
    });
  }
};

// ============================================
// UPDATE BANNER
// ============================================
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const { title, subtitle, offer, subtext, buttonText, buttonLink, order, isActive, isFeatured, startDate, endDate } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    let imageData = banner.image;
    if (req.file) {
      if (banner.image.publicId) {
        await cloudinaryService.deleteFile(banner.image.publicId);
      }

      const uploadResult = await cloudinaryService.uploadBuffer(
        req.file.buffer,
        'banners',
        {
          transformation: [
            { width: 1200, height: 400, crop: 'fill', gravity: 'auto' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        }
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary',
          error: uploadResult.error
        });
      }

      imageData = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    if (title) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (offer !== undefined) banner.offer = offer;
    if (subtext !== undefined) banner.subtext = subtext;
    if (buttonText) banner.buttonText = buttonText;
    if (buttonLink) banner.buttonLink = buttonLink;
    if (order !== undefined) banner.order = order;
    if (isActive !== undefined) banner.isActive = isActive;
    if (isFeatured !== undefined) banner.isFeatured = isFeatured;
    if (startDate !== undefined) banner.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) banner.endDate = endDate ? new Date(endDate) : null;
    banner.image = imageData;
    banner.updatedBy = adminId;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });

  } catch (error) {
    console.error('❌ Update banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error.message
    });
  }
};

// ============================================
// DELETE BANNER
// ============================================
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    if (banner.image.publicId) {
      await cloudinaryService.deleteFile(banner.image.publicId);
    }

    await banner.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error.message
    });
  }
};

// ============================================
// UPDATE BANNER ORDER
// ============================================
export const updateBannerOrder = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: 'Orders array is required'
      });
    }

    const updatePromises = orders.map(({ id, order }) => 
      Banner.findByIdAndUpdate(id, { order }, { new: true })
    );

    const updatedBanners = await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'Banner order updated successfully',
      data: updatedBanners
    });

  } catch (error) {
    console.error('❌ Update banner order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update banner order',
      error: error.message
    });
  }
};

// ============================================
// TOGGLE BANNER STATUS
// ============================================
export const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    banner.isActive = !banner.isActive;
    banner.updatedBy = adminId;
    await banner.save();

    return res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: banner
    });

  } catch (error) {
    console.error('❌ Toggle banner status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle banner status',
      error: error.message
    });
  }
};