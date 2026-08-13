// Backend/controllers/superAdminProductManagementController.js
//
// "Sellers & Products" admin view layer.
// Read-mostly: lets Super Admin browse sellers and drill into a seller's
// products using the EXISTING Product.seller.sellerId relationship
// (see JewelleryProduct model — "seller.sellerId" is the source of truth).
//
// All routes here are mounted behind the existing `router.use(protectSuperAdmin)`
// in superAdminRoutes.js, so no separate auth logic is needed in this file.

import mongoose from "mongoose";
import Seller from "../models/Seller.js";
import JewelleryProduct from "../models/JewelleryProduct.js";

// ============================================
// GET SELLERS + PRODUCT COUNTS (list page)
// GET /api/super-admin/sellers-products
// Query: status, page, limit, search
// ============================================
export const getSellersWithProductCounts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    // Only real Seller.status enum values are honored — "all" means no filter.
    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "storeInfo.storeName": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);
    const skip = (pageNum - 1) * limitNum;

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .select(
          "firstName lastName fullName email phone storeInfo status isActive createdAt profileImage",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Seller.countDocuments(query),
    ]);

    // ✅ Single aggregation for product counts across ALL sellers on this page —
    // avoids fetching every product per seller (no N+1).
    const sellerIds = sellers.map((s) => s._id);

    const productCounts = sellerIds.length
      ? await JewelleryProduct.aggregate([
          { $match: { "seller.sellerId": { $in: sellerIds } } },
          {
            $group: {
              _id: "$seller.sellerId",
              totalProducts: { $sum: 1 },
              activeProducts: {
                $sum: { $cond: [{ $ne: ["$status", "Archived"] }, 1, 0] },
              },
              publishedProducts: {
                $sum: { $cond: [{ $eq: ["$status", "Published"] }, 1, 0] },
              },
            },
          },
        ])
      : [];

    const countsMap = {};
    productCounts.forEach((pc) => {
      countsMap[pc._id.toString()] = pc;
    });

    const data = sellers.map((seller) => {
      const counts = countsMap[seller._id.toString()];
      return {
        _id: seller._id,
        firstName: seller.firstName,
        lastName: seller.lastName,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone,
        storeInfo: seller.storeInfo,
        status: seller.status,
        isActive: seller.isActive,
        createdAt: seller.createdAt,
        profileImage: seller.profileImage,
        productCounts: {
          total: counts?.totalProducts || 0,
          active: counts?.activeProducts || 0,
          published: counts?.publishedProducts || 0,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("❌ Get sellers with product counts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sellers",
      error: error.message,
    });
  }
};

// ============================================
// GET SELLER PRODUCT STATS (header of "View Products" page)
// GET /api/super-admin/sellers/:id/product-stats
// ============================================
export const getSellerProductStatsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid seller id" });
    }

    const seller = await Seller.findById(id).select(
      "firstName lastName fullName email phone storeInfo status createdAt updatedAt",
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(id);

    const [statusAgg, stockAgg] = await Promise.all([
      JewelleryProduct.aggregate([
        { $match: { "seller.sellerId": sellerObjectId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      JewelleryProduct.aggregate([
        {
          $match: {
            "seller.sellerId": sellerObjectId,
            status: { $ne: "Archived" },
          },
        },
        { $group: { _id: "$inventory.availability", count: { $sum: 1 } } },
      ]),
    ]);

    const byStatus = {};
    statusAgg.forEach((s) => {
      byStatus[s._id || "Unknown"] = s.count;
    });

    const byStock = {};
    stockAgg.forEach((s) => {
      byStock[s._id || "Unknown"] = s.count;
    });

    const totalProducts = statusAgg.reduce((sum, s) => sum + s.count, 0);
    const archivedCount = byStatus["Archived"] || 0;

    return res.status(200).json({
      success: true,
      data: {
        seller,
        productStats: {
          total: totalProducts,
          active: totalProducts - archivedCount,
          published: byStatus["Published"] || 0,
          draft: byStatus["Draft"] || 0,
          pending: byStatus["Pending"] || 0,
          scheduled: byStatus["Scheduled"] || 0,
          archived: archivedCount,
          rejected: byStatus["Rejected"] || 0,
          inStock: byStock["In Stock"] || 0,
          outOfStock: byStock["Out of Stock"] || 0,
          preOrder: byStock["Pre Order"] || 0,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get seller product stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller product stats",
      error: error.message,
    });
  }
};

// ============================================
// GET SELLER'S PRODUCTS (paginated, searched, filtered)
// GET /api/super-admin/sellers/:id/products
// Query: page, limit, search, status, categoryId, stockStatus
//   stockStatus: all | in_stock | out_of_stock | pre_order | low_stock
// ============================================
export const getSellerProductsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid seller id" });
    }

    const seller = await Seller.findById(id).select(
      "firstName lastName fullName email storeInfo status",
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const {
      page = 1,
      limit = 20,
      search,
      status,
      categoryId,
      stockStatus,
    } = req.query;

    // ✅ Uses the ACTUAL seller↔product relationship on the schema:
    // JewelleryProduct.seller.sellerId (see model, indexed as
    // { "seller.sellerId": 1, status: 1 }).
    const query = { "seller.sellerId": id };

    // Only real JewelleryProduct status enum values are honored.
    if (status && status !== "all") {
      query.status = status;
    }

    if (categoryId) {
      query["category.categoryId"] = categoryId;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { "category.categoryData.label": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);
    const skip = (pageNum - 1) * limitNum;

    // Stock filters — all derived from real fields on the Product schema.
    // "low_stock" uses inventory.lowStockThreshold, which already exists
    // on the model, via $expr rather than inventing a stored enum value.
    let findQuery;
    if (stockStatus === "low_stock") {
      findQuery = JewelleryProduct.find({
        ...query,
        $expr: {
          $and: [
            { $gt: ["$inventory.stockQuantity", 0] },
            {
              $lte: [
                "$inventory.stockQuantity",
                { $ifNull: ["$inventory.lowStockThreshold", 5] },
              ],
            },
          ],
        },
      });
    } else {
      const stockMap = {
        in_stock: "In Stock",
        out_of_stock: "Out of Stock",
        pre_order: "Pre Order",
      };
      if (stockStatus && stockStatus !== "all" && stockMap[stockStatus]) {
        query["inventory.availability"] = stockMap[stockStatus];
      }
      findQuery = JewelleryProduct.find(query);
    }

    // Need the same filter applied for the count — rebuild count query to match.
    const countQuery =
      stockStatus === "low_stock"
        ? {
            ...query,
            $expr: {
              $and: [
                { $gt: ["$inventory.stockQuantity", 0] },
                {
                  $lte: [
                    "$inventory.stockQuantity",
                    { $ifNull: ["$inventory.lowStockThreshold", 5] },
                  ],
                },
              ],
            },
          }
        : query;

    const [products, total] = await Promise.all([
      findQuery
        .select("-pricing.costPrice -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      JewelleryProduct.countDocuments(countQuery),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        seller,
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get seller products (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller products",
      error: error.message,
    });
  }
};

// ============================================
// GET SINGLE PRODUCT DETAIL (scoped to the seller — prevents cross-seller leaks)
// GET /api/super-admin/sellers/:id/products/:productId
// ============================================
export const getSellerProductDetailAdmin = async (req, res) => {
  try {
    const { id, productId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const product = await JewelleryProduct.findOne({
      _id: productId,
      "seller.sellerId": id,
    }).select("-pricing.costPrice -__v");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this seller",
      });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("❌ Get seller product detail (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
      error: error.message,
    });
  }
};
