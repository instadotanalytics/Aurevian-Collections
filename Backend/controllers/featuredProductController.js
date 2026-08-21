// backend/controllers/featuredProductController.js

console.log("🔧 Loading featuredProductController...");

import mongoose from "mongoose";
import FeaturedProduct, {
  FEATURED_SECTIONS,
} from "../models/FeaturedProduct.js";
import JewelleryProduct from "../models/JewelleryProduct.js";

console.log("✅ featuredProductController loaded");

const isValidSection = (section) => FEATURED_SECTIONS.includes(section);

// ============================================
// PUBLIC — GET FEATURED PRODUCTS FOR A SECTION
// ============================================
export const getPublicFeaturedProducts = async (req, res) => {
  console.log(
    "✅ getPublicFeaturedProducts called with section:",
    req.params.section,
  );
  try {
    const { section } = req.params;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    const entries = await FeaturedProduct.find({ section, isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .populate({
        path: "product",
        select:
          "productName productSlug thumbnail pricing reviews status isActive labels category seller.sellerId",
      })
      .lean();

    const products = entries
      .filter(
        (e) =>
          e.product && e.product.status === "Published" && e.product.isActive,
      )
      .map((e) => ({
        featuredId: e._id,
        order: e.order,
        ...e.product,
      }));

    console.log(
      `📊 ${products.length} featured products for section "${section}"`,
    );

    return res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error("❌ Get public featured products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get featured products",
    });
  }
};

// ============================================
// SELLER — GET FULL LIST FOR A SECTION (includes inactive entries)
// Only returns entries belonging to the authenticated seller
// ============================================
export const getSellerFeaturedProducts = async (req, res) => {
  console.log(
    "✅ getSellerFeaturedProducts called with section:",
    req.params.section,
  );
  try {
    const { section } = req.params;
    const sellerId = req.seller._id;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    const entries = await FeaturedProduct.find({
      section,
      sellerId: sellerId,
    })
      .sort({ order: 1, createdAt: 1 })
      .populate({
        path: "product",
        select:
          "productName productSlug thumbnail pricing status isActive seller.storeName",
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error("❌ Get seller featured products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get featured products",
    });
  }
};

// ============================================
// SELLER — SEARCH EXISTING PRODUCTS TO ADD
// Only surfaces the seller's own Published + active products
// ============================================
export const getSellerAvailableProductsForFeaturing = async (req, res) => {
  console.log("✅ getSellerAvailableProductsForFeaturing called");
  try {
    const { section, search, page = 1, limit = 20 } = req.query;
    const sellerId = req.seller._id;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    // Get products already featured by this seller in this section
    const alreadyFeatured = await FeaturedProduct.find({
      section,
      sellerId: sellerId,
    }).distinct("product");

    const query = {
      "seller.sellerId": sellerId,
      status: "Published",
      isActive: true,
      _id: { $nin: alreadyFeatured },
    };

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      JewelleryProduct.find(query)
        .select(
          "productName productSlug thumbnail pricing category seller.storeName status",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JewelleryProduct.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get seller available products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search products",
    });
  }
};

// ============================================
// SELLER — ADD AN EXISTING PRODUCT TO A SECTION
// Only allows adding the seller's own products
// ============================================
export const addSellerFeaturedProduct = async (req, res) => {
  console.log("✅ addSellerFeaturedProduct called:", req.body);
  try {
    const { section, productId } = req.body;
    const sellerId = req.seller._id;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid productId is required",
      });
    }

    // ✅ Verify the product belongs to this seller
    const product = await JewelleryProduct.findOne({
      _id: productId,
      "seller.sellerId": sellerId,
    }).select("_id productName status isActive");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or does not belong to you",
      });
    }

    // Check if this seller already featured this product in this section
    const existingEntry = await FeaturedProduct.findOne({
      section,
      product: productId,
      sellerId: sellerId,
    });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message: "This product is already added to this section",
      });
    }

    const maxOrderDoc = await FeaturedProduct.findOne({
      section,
      sellerId: sellerId,
    })
      .sort({ order: -1 })
      .select("order");

    const nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

    const entry = await FeaturedProduct.create({
      section,
      product: productId,
      order: nextOrder,
      sellerId: sellerId,
      addedBy: null, // Seller-added, not super admin
    });

    const populated = await entry.populate({
      path: "product",
      select: "productName productSlug thumbnail pricing status isActive",
    });

    console.log(
      `✅ Product "${product.productName}" added to section "${section}" by seller ${sellerId}`,
    );

    return res.status(201).json({
      success: true,
      message: "Product added to section successfully",
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This product is already added to this section",
      });
    }
    console.error("❌ Add seller featured product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product to section",
    });
  }
};

// ============================================
// SELLER — REMOVE A PRODUCT FROM A SECTION
// Only allows removing the seller's own entries
// ============================================
export const removeSellerFeaturedProduct = async (req, res) => {
  console.log("✅ removeSellerFeaturedProduct called with id:", req.params.id);
  try {
    const { id } = req.params;
    const sellerId = req.seller._id;

    const entry = await FeaturedProduct.findOneAndDelete({
      _id: id,
      sellerId: sellerId,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Featured product entry not found or does not belong to you",
      });
    }

    console.log("✅ Featured product entry removed:", id);

    return res.status(200).json({
      success: true,
      message: "Product removed from section successfully",
    });
  } catch (error) {
    console.error("❌ Remove seller featured product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove product from section",
    });
  }
};

// ============================================
// SELLER — TOGGLE ACTIVE STATUS FOR ONE ENTRY
// Only allows toggling the seller's own entries
// ============================================
export const toggleSellerFeaturedProductStatus = async (req, res) => {
  console.log(
    "✅ toggleSellerFeaturedProductStatus called with id:",
    req.params.id,
  );
  try {
    const { id } = req.params;
    const sellerId = req.seller._id;

    const entry = await FeaturedProduct.findOne({
      _id: id,
      sellerId: sellerId,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Featured product entry not found or does not belong to you",
      });
    }

    entry.isActive = !entry.isActive;
    await entry.save();

    return res.status(200).json({
      success: true,
      message: `Product ${entry.isActive ? "activated" : "deactivated"} for this section`,
      data: entry,
    });
  } catch (error) {
    console.error("❌ Toggle seller featured product status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};

// ============================================
// SELLER — REORDER PRODUCTS WITHIN A SECTION
// Only allows reordering the seller's own entries
// ============================================
export const reorderSellerFeaturedProducts = async (req, res) => {
  console.log("✅ reorderSellerFeaturedProducts called:", req.body);
  try {
    const { section, orderedIds } = req.body;
    const sellerId = req.seller._id;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderedIds must be a non-empty array",
      });
    }

    // Verify all entries belong to this seller
    const entries = await FeaturedProduct.find({
      _id: { $in: orderedIds },
      sellerId: sellerId,
      section: section,
    });

    if (entries.length !== orderedIds.length) {
      return res.status(403).json({
        success: false,
        message: "Some entries do not belong to you or do not exist",
      });
    }

    const ops = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, section, sellerId: sellerId },
        update: { $set: { order: index } },
      },
    }));

    await FeaturedProduct.bulkWrite(ops);

    console.log(
      `✅ Reordered ${orderedIds.length} entries for section "${section}" by seller ${sellerId}`,
    );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("❌ Reorder seller featured products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
};

// ============================================
// ADMIN — GET FULL LIST FOR A SECTION (includes all sellers)
// ============================================
export const getFeaturedProductsAdmin = async (req, res) => {
  console.log(
    "✅ getFeaturedProductsAdmin called with section:",
    req.params.section,
  );
  try {
    const { section } = req.params;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    const entries = await FeaturedProduct.find({ section })
      .sort({ order: 1, createdAt: 1 })
      .populate({
        path: "product",
        select:
          "productName productSlug thumbnail pricing status isActive seller.storeName",
      })
      .populate({
        path: "sellerId",
        select: "firstName lastName storeInfo.storeName email",
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error("❌ Get admin featured products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get featured products",
    });
  }
};

// ============================================
// ADMIN — SEARCH ALL PRODUCTS TO ADD (across all sellers)
// ============================================
export const getAvailableProductsForFeaturing = async (req, res) => {
  console.log("✅ getAvailableProductsForFeaturing called");
  try {
    const { section, search, page = 1, limit = 20 } = req.query;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    const alreadyFeatured = await FeaturedProduct.find({ section }).distinct(
      "product",
    );

    const query = {
      status: "Published",
      isActive: true,
      _id: { $nin: alreadyFeatured },
    };

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      JewelleryProduct.find(query)
        .select(
          "productName productSlug thumbnail pricing category seller.storeName status",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JewelleryProduct.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get available products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search products",
    });
  }
};

// ============================================
// ADMIN — ADD ANY PRODUCT TO A SECTION
// ============================================
export const addFeaturedProduct = async (req, res) => {
  console.log("✅ addFeaturedProduct called:", req.body);
  try {
    const { section, productId, sellerId } = req.body;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid productId is required",
      });
    }

    const product = await JewelleryProduct.findById(productId).select(
      "_id productName status isActive",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Use provided sellerId or extract from product
    const targetSellerId = sellerId || product.seller?.sellerId || null;

    const maxOrderDoc = await FeaturedProduct.findOne({ section })
      .sort({ order: -1 })
      .select("order");

    const nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

    const entry = await FeaturedProduct.create({
      section,
      product: productId,
      order: nextOrder,
      sellerId: targetSellerId,
      addedBy: req.admin?._id || null,
    });

    const populated = await entry.populate({
      path: "product",
      select: "productName productSlug thumbnail pricing status isActive",
    });

    console.log(
      `✅ Product "${product.productName}" added to section "${section}" by admin`,
    );

    return res.status(201).json({
      success: true,
      message: "Product added to section successfully",
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This product is already added to this section",
      });
    }
    console.error("❌ Add featured product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product to section",
    });
  }
};

// ============================================
// ADMIN — REMOVE ANY PRODUCT FROM A SECTION
// ============================================
export const removeFeaturedProduct = async (req, res) => {
  console.log("✅ removeFeaturedProduct called with id:", req.params.id);
  try {
    const { id } = req.params;

    const entry = await FeaturedProduct.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Featured product entry not found",
      });
    }

    console.log("✅ Featured product entry removed:", id);

    return res.status(200).json({
      success: true,
      message: "Product removed from section successfully",
    });
  } catch (error) {
    console.error("❌ Remove featured product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove product from section",
    });
  }
};

// ============================================
// ADMIN — TOGGLE ACTIVE STATUS FOR ANY ENTRY
// ============================================
export const toggleFeaturedProductStatus = async (req, res) => {
  console.log("✅ toggleFeaturedProductStatus called with id:", req.params.id);
  try {
    const { id } = req.params;

    const entry = await FeaturedProduct.findById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Featured product entry not found",
      });
    }

    entry.isActive = !entry.isActive;
    await entry.save();

    return res.status(200).json({
      success: true,
      message: `Product ${entry.isActive ? "activated" : "deactivated"} for this section`,
      data: entry,
    });
  } catch (error) {
    console.error("❌ Toggle featured product status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};

// ============================================
// ADMIN — REORDER ALL PRODUCTS WITHIN A SECTION
// ============================================
export const reorderFeaturedProducts = async (req, res) => {
  console.log("✅ reorderFeaturedProducts called:", req.body);
  try {
    const { section, orderedIds } = req.body;

    if (!isValidSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${FEATURED_SECTIONS.join(", ")}`,
      });
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderedIds must be a non-empty array",
      });
    }

    const ops = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, section },
        update: { $set: { order: index } },
      },
    }));

    await FeaturedProduct.bulkWrite(ops);

    console.log(
      `✅ Reordered ${orderedIds.length} entries for section "${section}"`,
    );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("❌ Reorder featured products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
};

console.log("✅ featuredProductController fully loaded");
