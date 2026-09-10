console.log("🔧 Loading jewelleryProductController...");

import JewelleryProduct from "../models/JewelleryProduct.js";
import Seller from "../models/Seller.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import cloudinaryService from "../services/cloudinaryService.js";
import mongoose from "mongoose";
import {
  getActiveHeaderConfig,
  validateCategoryFromHeader,
  getCategoriesForDropdown,
} from "../services/headerConfigService.js";

// ✅ NEW — location-aware ranking (Features 3/4/5/10/13)
import {
  isValidCoordinate,
  parseCoordinate,
  haversineKm,
  getZoneForDistance,
  zoneLabel,
  buildLocationAggregationStages,
} from "../utils/geoUtils.js";
import { getLocationSettings } from "../services/locationSettingsService.js";

console.log("✅ jewelleryProductController loaded");

const parseBool = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return defaultValue;
};

const normalizeReturnPolicy = (product) => {
  if (!product) return product;

  if (!product.returnPolicy) {
    product.returnPolicy = { returnAvailable: true, returnDays: 7 };
    return product;
  }

  product.returnPolicy.returnAvailable = true;

  if (
    product.returnPolicy.returnDays === undefined ||
    product.returnPolicy.returnDays === null
  ) {
    product.returnPolicy.returnDays = 7;
  }

  return product;
};

// ✅ NEW — attaches a customer-safe `locationInfo` block (distance +
// zone label only — never raw seller coordinates, per Feature 13) and
// strips the internal ranking fields the aggregation added.
function attachLocationInfo(product) {
  if (product.distanceKm != null) {
    product.locationInfo = {
      distanceKm: Math.round(product.distanceKm * 10) / 10,
      zone: product.locationZone,
      zoneLabel: zoneLabel(product.locationZone),
    };
  } else {
    product.locationInfo = null;
  }
  delete product.distanceKm;
  delete product.locationZone;
  delete product.zoneRankValue;
  return product;
}

// ============================================
// GET CATEGORIES FROM HEADER CONFIG
// ============================================
export const getProductCategories = async (req, res) => {
  console.log("✅ getProductCategories called");
  try {
    console.log("📊 Fetching categories from header config...");
    const categories = await getCategoriesForDropdown();
    console.log("📊 Categories found:", categories.length);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("❌ Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL PRODUCTS FOR SELLER
// ============================================
export const getSellerProducts = async (req, res) => {
  console.log("✅ getSellerProducts called");
  try {
    const seller = req.seller;
    console.log("👤 Seller:", seller?._id || "❌ No seller found");

    if (!seller) {
      console.log("❌ No seller in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { status, categoryId, search, page = 1, limit = 20 } = req.query;
    console.log("📊 Query params:", {
      status,
      categoryId,
      search,
      page,
      limit,
    });

    const query = { "seller.sellerId": seller._id };

    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: "Archived" };
    }

    if (categoryId) query["category.categoryId"] = categoryId;
    if (search) {
      query.$text = { $search: search };
    }

    console.log("🔍 MongoDB Query:", JSON.stringify(query, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      JewelleryProduct.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JewelleryProduct.countDocuments(query),
    ]);

    console.log("📊 Products found:", products.length);
    console.log("📊 Total products:", total);

    const limitStatus = await JewelleryProduct.getProductLimitStatus(
      seller._id,
    );
    console.log("📊 Limit status:", limitStatus);

    return res.status(200).json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total || 0,
          totalPages: Math.ceil((total || 0) / parseInt(limit)),
        },
        limitStatus: limitStatus || {
          limit: 50,
          used: 0,
          remaining: 50,
          isUnlimited: false,
          planName: "Free",
        },
      },
    });
  } catch (error) {
    console.error("❌ Get seller products error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get products",
    });
  }
};

// ============================================
// GET PRODUCT LIMIT STATUS
// ============================================
export const getProductLimitStatus = async (req, res) => {
  console.log("✅ getProductLimitStatus called");
  try {
    const seller = req.seller;
    console.log("👤 Seller:", seller?._id || "❌ No seller found");

    if (!seller) {
      console.log("❌ No seller in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const limitStatus = await JewelleryProduct.getProductLimitStatus(
      seller._id,
    );
    console.log("📊 Limit status:", limitStatus);

    return res.status(200).json({
      success: true,
      data: limitStatus,
    });
  } catch (error) {
    console.error("❌ Get product limit status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get product limit status",
    });
  }
};

// ============================================
// CREATE PRODUCT
// ============================================
export const createProduct = async (req, res) => {
  console.log("✅ createProduct called");
  try {
    const seller = req.seller;
    const productData = req.body;

    console.log(
      "📦 Creating product for seller:",
      seller?._id || "❌ No seller",
    );
    console.log("📦 Product data:", JSON.stringify(productData, null, 2));

    if (!seller) {
      console.log("❌ No seller in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!req.files || !req.files.thumbnail || !req.files.thumbnail[0]) {
      console.log("❌ No thumbnail uploaded");
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      });
    }

    if (!req.files.images || req.files.images.length < 2) {
      console.log(
        "❌ Less than 2 images uploaded:",
        req.files.images?.length || 0,
      );
      return res.status(400).json({
        success: false,
        message: "At least 2 product images are required",
      });
    }

    console.log("📤 Uploading thumbnail to Cloudinary...");

    let thumbnailResult = null;
    let retries = 3;

    while (retries > 0 && !thumbnailResult?.success) {
      try {
        thumbnailResult = await cloudinaryService.uploadBuffer(
          req.files.thumbnail[0].buffer,
          `products/${seller._id}`,
          { timeout: 60000 },
        );

        if (!thumbnailResult.success) {
          console.log(
            `⚠️ Thumbnail upload attempt failed, retries left: ${retries - 1}`,
          );
          retries--;
          if (retries > 0) {
            console.log(`⏳ Waiting 2 seconds before retry...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } else {
          break;
        }
      } catch (error) {
        console.error(
          `❌ Thumbnail upload attempt ${4 - retries} failed:`,
          error.message,
        );
        retries--;
        if (retries > 0) {
          console.log(`⏳ Waiting 2 seconds before retry...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          thumbnailResult = { success: false, error: error.message };
        }
      }
    }

    if (!thumbnailResult || !thumbnailResult.success) {
      console.log(
        "❌ Thumbnail upload failed after retries:",
        thumbnailResult?.error || "Unknown error",
      );
      return res.status(500).json({
        success: false,
        message: `Thumbnail upload failed: ${thumbnailResult?.error || "Request timeout. Please try with a smaller image (under 2MB)."}`,
      });
    }
    console.log("✅ Thumbnail uploaded:", thumbnailResult.url);

    console.log("📤 Uploading product images to Cloudinary...");
    const uploadedImages = [];

    for (let i = 0; i < req.files.images.length; i++) {
      let imageResult = null;
      let imageRetries = 3;

      while (imageRetries > 0 && !imageResult?.success) {
        try {
          imageResult = await cloudinaryService.uploadBuffer(
            req.files.images[i].buffer,
            `products/${seller._id}`,
            { timeout: 60000 },
          );

          if (!imageResult.success) {
            console.log(
              `⚠️ Image ${i + 1} upload attempt failed, retries left: ${imageRetries - 1}`,
            );
            imageRetries--;
            if (imageRetries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          } else {
            break;
          }
        } catch (error) {
          console.error(
            `❌ Image ${i + 1} upload attempt ${4 - imageRetries} failed:`,
            error.message,
          );
          imageRetries--;
          if (imageRetries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            imageResult = { success: false, error: error.message };
          }
        }
      }

      if (imageResult && imageResult.success) {
        uploadedImages.push({
          url: imageResult.url,
          publicId: imageResult.publicId,
          altText: productData.images?.[i]?.altText || "",
          order: i,
        });
        console.log(`✅ Image ${i + 1} uploaded:`, imageResult.url);
      } else {
        console.log(
          `❌ Image ${i + 1} upload failed after retries:`,
          imageResult?.error || "Unknown error",
        );
      }
    }

    if (uploadedImages.length === 0) {
      console.log("❌ No product images uploaded successfully");
      return res.status(500).json({
        success: false,
        message:
          "Failed to upload product images. Please try again with smaller images.",
      });
    }
    console.log(`✅ ${uploadedImages.length} images uploaded successfully`);

    const limitStatus = await JewelleryProduct.getProductLimitStatus(
      seller._id,
    );
    console.log("📊 Limit status:", limitStatus);

    if (!limitStatus.isUnlimited && limitStatus.remaining <= 0) {
      console.log("❌ Product limit reached!");
      return res.status(403).json({
        success: false,
        message: `Product limit reached. Your ${limitStatus.planName} plan allows ${limitStatus.limit} products.`,
        data: limitStatus,
      });
    }

    const { categoryId, subCategoryId } = productData;

    if (!categoryId) {
      console.log("❌ No categoryId provided");
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    let categoryValidation;
    try {
      console.log("🔍 Validating category:", categoryId);
      categoryValidation = await validateCategoryFromHeader(
        categoryId,
        subCategoryId,
      );
      console.log(
        "✅ Category validated:",
        categoryValidation.mainCategory.label,
      );
    } catch (error) {
      console.error("❌ Category validation failed:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const plan = await SubscriptionPlan.findOne({
      id: seller.subscriptionPlanId || "free",
    });
    const imagesPerProduct = plan?.imagesPerProduct || 5;
    console.log(
      "📊 Plan:",
      plan?.name || "Free",
      "Images per product:",
      imagesPerProduct,
    );

    const totalImages = uploadedImages.length + 1;
    if (totalImages > imagesPerProduct) {
      console.log(
        "❌ Image limit exceeded:",
        totalImages,
        ">",
        imagesPerProduct,
      );
      return res.status(400).json({
        success: false,
        message: `Your ${plan?.name || "Free"} plan allows only ${imagesPerProduct} images per product.`,
      });
    }

    let variants = [];
    if (productData.hasVariants && productData.variants) {
      try {
        variants =
          typeof productData.variants === "string"
            ? JSON.parse(productData.variants)
            : productData.variants;
        console.log("📦 Variants:", variants.length);
      } catch (error) {
        console.error("❌ Invalid variants format:", error.message);
        return res.status(400).json({
          success: false,
          message: "Invalid variants format",
        });
      }
    }

    let placements = [];
    if (productData.placements) {
      try {
        placements =
          typeof productData.placements === "string"
            ? JSON.parse(productData.placements)
            : productData.placements;
        console.log("📌 Placements:", placements);
      } catch (error) {
        console.error("❌ Invalid placements format:", error.message);
        placements = [];
      }
    }

    const product = new JewelleryProduct({
      productName: productData.productName,
      productSlug: productData.productSlug || undefined,
      shortDescription: productData.shortDescription || "",
      fullDescription: productData.fullDescription || "",
      brand: productData.brand || "",

      category: {
        categoryId: categoryId,
        categoryData: {
          id: categoryValidation.mainCategory.id,
          label: categoryValidation.mainCategory.label,
          path: categoryValidation.mainCategory.path,
          image: categoryValidation.mainCategory.image || "",
        },
        subCategoryId: subCategoryId || null,
        subCategoryData: categoryValidation.subCategory
          ? {
              id: categoryValidation.subCategory.id,
              label: categoryValidation.subCategory.label,
              path: categoryValidation.subCategory.path,
              image: categoryValidation.subCategory.image || "",
            }
          : null,
      },

      thumbnail: {
        url: thumbnailResult.url,
        publicId: thumbnailResult.publicId,
        altText: productData.thumbnail?.altText || "",
      },
      images: uploadedImages,

      pricing: {
        originalPrice: productData.originalPrice || 0,
        salePrice: productData.salePrice || null,
        costPrice: productData.costPrice || null,
        currency: productData.currency || "INR",
        taxIncluded: parseBool(productData.taxIncluded, true),
      },

      inventory: {
        stockQuantity: productData.stockQuantity || 0,
        minOrderQty: productData.minOrderQty || 1,
        maxOrderQty: productData.maxOrderQty || null,
        availability: productData.availability || "Out of Stock",
      },

      specifications: {
        material: productData.material || "Gold",
        plating: productData.plating || "None",
        stoneType: productData.stoneType || "None",
        stoneColor: productData.stoneColor || "Clear",
        finish: productData.finish || "Polished",
        weight: {
          value: productData.weight || 0,
          unit: productData.weightUnit || "g",
        },
        size: productData.size || "Free Size",
        adjustable: parseBool(productData.adjustable, false),
        occasion: productData.occasion || "Casual",
        style: productData.style || "Modern",
        collection: productData.collection || "",
        gender: productData.gender || "Unisex",
      },

      hasVariants: parseBool(productData.hasVariants, false),
      variants: variants,

      shipping: {
        weight: {
          value: productData.shippingWeight || 0,
          unit: productData.shippingWeightUnit || "g",
        },
        dimensions: {
          length: productData.shippingLength || 0,
          width: productData.shippingWidth || 0,
          height: productData.shippingHeight || 0,
          unit: productData.shippingDimensionUnit || "cm",
        },
        freeShipping: parseBool(productData.freeShipping, false),
        shippingType: productData.shippingType || "Customer Pays",
      },

      returnPolicy: {
        returnAvailable: parseBool(productData.returnAvailable, true),
        returnDays: productData.returnDays || 7,
        warrantyAvailable: parseBool(productData.warrantyAvailable, false),
        warrantyDuration: productData.warrantyDuration || "1 Year",
      },

      seo: {
        title: productData.seoTitle || productData.productName,
        description:
          productData.seoDescription || productData.shortDescription || "",
        keywords: productData.seoKeywords
          ? productData.seoKeywords.split(",").map((k) => k.trim())
          : [],
        canonicalUrl: productData.canonicalUrl || null,
      },

      labels: {
        featured: parseBool(productData.featured, false),
        trending: parseBool(productData.trending, false),
        bestSeller: parseBool(productData.bestSeller, false),
        newArrival: parseBool(productData.newArrival, false),
        flashSale: parseBool(productData.flashSale, false),
      },

      seller: {
        sellerId: seller._id,
        createdBy: seller._id,
        sellerName: seller.firstName + " " + (seller.lastName || ""),
        sellerEmail: seller.email,
        storeName: seller.storeName || null,
      },

      status: productData.status || "Draft",

      placements: placements,
    });

    await product.save();
    console.log(`✅ Product created: ${product.productName} (${product._id})`);
    console.log(
      `📦 returnPolicy.returnAvailable saved as:`,
      product.returnPolicy?.returnAvailable,
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌ Create product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// ============================================
// GET PRODUCT BY SLUG (Public)
// ✅ CHANGED — accepts optional ?lat=&lng= and, when both the request
// and the owning seller's showroom have valid coordinates, includes a
// customer-safe `locationInfo` (distance + zone label). Raw seller
// coordinates are always stripped from the response (Feature 13).
// ============================================
export const getProductBySlug = async (req, res) => {
  console.log("✅ getProductBySlug called with slug:", req.params.slug);
  try {
    const { slug } = req.params;
    const { lat, lng } = req.query;

    const product = await JewelleryProduct.findOne({
      productSlug: slug,
      status: "Published",
      isActive: true,
    }).populate(
      "seller.sellerId",
      "firstName lastName storeName email pickupAddress.coordinates pickupAddress.city storeInfo.storeName",
    );

    if (!product) {
      console.log("❌ Product not found for slug:", slug);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("✅ Product found:", product.productName);
    await product.updateOne({ $inc: { viewedCount: 1 } });

    normalizeReturnPolicy(product);

    const userLat = parseCoordinate(lat);
    const userLng = parseCoordinate(lng);
    const sellerCoords = product.seller?.sellerId?.pickupAddress?.coordinates;

    let locationInfo = null;
    if (
      isValidCoordinate(userLat, userLng) &&
      sellerCoords &&
      isValidCoordinate(sellerCoords.lat, sellerCoords.lng)
    ) {
      const settings = await getLocationSettings();
      if (settings.locationRankingEnabled) {
        const distanceKm = haversineKm(
          userLat,
          userLng,
          sellerCoords.lat,
          sellerCoords.lng,
        );
        if (distanceKm != null) {
          const zone = getZoneForDistance(distanceKm, settings);
          locationInfo = {
            distanceKm: Math.round(distanceKm * 10) / 10,
            zone,
            zoneLabel: zoneLabel(zone),
          };
        }
      }
    }

    const productObj = product.toObject();
    // Never leak the seller's exact showroom coordinates to the storefront.
    if (
      productObj.seller?.sellerId &&
      typeof productObj.seller.sellerId === "object"
    ) {
      delete productObj.seller.sellerId.pickupAddress;
    }
    productObj.locationInfo = locationInfo;

    return res.status(200).json({
      success: true,
      data: productObj,
    });
  } catch (error) {
    console.error("❌ Get product by slug error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get product",
    });
  }
};

// ============================================
// UPDATE PRODUCT
// ============================================
export const updateProduct = async (req, res) => {
  console.log("✅ updateProduct called with id:", req.params.id);
  try {
    const seller = req.seller;
    const { id } = req.params;
    const updateData = req.body;

    console.log("👤 Seller:", seller?._id || "❌ No seller");

    if (!seller) {
      console.log("❌ No seller in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const product = await JewelleryProduct.findOne({
      _id: id,
      "seller.sellerId": seller._id,
    });

    if (!product) {
      console.log("❌ Product not found for id:", id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("✅ Product found:", product.productName);

    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      console.log("📤 Uploading new thumbnail...");

      if (product.thumbnail?.publicId) {
        console.log("🗑️ Deleting old thumbnail:", product.thumbnail.publicId);
        await cloudinaryService.deleteFile(product.thumbnail.publicId);
      }

      let thumbnailResult = null;
      let retries = 3;

      while (retries > 0 && !thumbnailResult?.success) {
        try {
          thumbnailResult = await cloudinaryService.uploadBuffer(
            req.files.thumbnail[0].buffer,
            `products/${seller._id}`,
            { timeout: 60000 },
          );

          if (!thumbnailResult.success) {
            console.log(
              `⚠️ Thumbnail upload attempt failed, retries left: ${retries - 1}`,
            );
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          } else {
            break;
          }
        } catch (error) {
          console.error(
            `❌ Thumbnail upload attempt ${4 - retries} failed:`,
            error.message,
          );
          retries--;
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            thumbnailResult = { success: false, error: error.message };
          }
        }
      }

      if (!thumbnailResult || !thumbnailResult.success) {
        console.log(
          "❌ Thumbnail upload failed after retries:",
          thumbnailResult?.error || "Unknown error",
        );
        return res.status(500).json({
          success: false,
          message: `Thumbnail upload failed: ${thumbnailResult?.error || "Request timeout. Please try with a smaller image."}`,
        });
      }

      updateData.thumbnail = {
        url: thumbnailResult.url,
        publicId: thumbnailResult.publicId,
        altText: updateData.thumbnail?.altText || "",
      };
      console.log("✅ New thumbnail uploaded:", thumbnailResult.url);
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log(`📤 Uploading ${req.files.images.length} new images...`);

      if (product.images && product.images.length > 0) {
        console.log(`🗑️ Deleting ${product.images.length} old images...`);
        for (const image of product.images) {
          if (image.publicId) {
            await cloudinaryService.deleteFile(image.publicId);
          }
        }
      }

      const uploadedImages = [];
      for (let i = 0; i < req.files.images.length; i++) {
        let imageResult = null;
        let imageRetries = 3;

        while (imageRetries > 0 && !imageResult?.success) {
          try {
            imageResult = await cloudinaryService.uploadBuffer(
              req.files.images[i].buffer,
              `products/${seller._id}`,
              { timeout: 60000 },
            );

            if (!imageResult.success) {
              console.log(
                `⚠️ Image ${i + 1} upload attempt failed, retries left: ${imageRetries - 1}`,
              );
              imageRetries--;
              if (imageRetries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
            } else {
              break;
            }
          } catch (error) {
            console.error(
              `❌ Image ${i + 1} upload attempt ${4 - imageRetries} failed:`,
              error.message,
            );
            imageRetries--;
            if (imageRetries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            } else {
              imageResult = { success: false, error: error.message };
            }
          }
        }

        if (imageResult && imageResult.success) {
          uploadedImages.push({
            url: imageResult.url,
            publicId: imageResult.publicId,
            altText: updateData.images?.[i]?.altText || "",
            order: i,
          });
          console.log(`✅ Image ${i + 1} uploaded:`, imageResult.url);
        } else {
          console.log(
            `❌ Image ${i + 1} upload failed after retries:`,
            imageResult?.error || "Unknown error",
          );
        }
      }

      if (uploadedImages.length > 0) {
        updateData.images = uploadedImages;
        console.log(`✅ ${uploadedImages.length} images uploaded successfully`);
      }
    }

    if (updateData.categoryId) {
      try {
        console.log("🔍 Validating category update:", updateData.categoryId);
        const categoryValidation = await validateCategoryFromHeader(
          updateData.categoryId,
          updateData.subCategoryId || null,
        );

        updateData["category.categoryId"] = updateData.categoryId;
        updateData["category.categoryData"] = {
          id: categoryValidation.mainCategory.id,
          label: categoryValidation.mainCategory.label,
          path: categoryValidation.mainCategory.path,
          image: categoryValidation.mainCategory.image || "",
        };

        if (updateData.subCategoryId) {
          updateData["category.subCategoryId"] = updateData.subCategoryId;
          updateData["category.subCategoryData"] = {
            id: categoryValidation.subCategory.id,
            label: categoryValidation.subCategory.label,
            path: categoryValidation.subCategory.path,
            image: categoryValidation.subCategory.image || "",
          };
        } else {
          updateData["category.subCategoryId"] = null;
          updateData["category.subCategoryData"] = null;
        }

        delete updateData.categoryId;
        delete updateData.subCategoryId;
        console.log("✅ Category updated");
      } catch (error) {
        console.error("❌ Category validation failed:", error.message);
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    if (updateData.variants) {
      try {
        updateData.variants =
          typeof updateData.variants === "string"
            ? JSON.parse(updateData.variants)
            : updateData.variants;
        console.log("📦 Variants updated:", updateData.variants.length);
      } catch (error) {
        console.error("❌ Invalid variants format:", error.message);
        return res.status(400).json({
          success: false,
          message: "Invalid variants format",
        });
      }
    }

    if (updateData.placements) {
      try {
        updateData.placements =
          typeof updateData.placements === "string"
            ? JSON.parse(updateData.placements)
            : updateData.placements;
        console.log("📌 Placements updated:", updateData.placements);
      } catch (error) {
        console.error("❌ Invalid placements format:", error.message);
        delete updateData.placements;
      }
    }

    if (updateData.returnAvailable !== undefined) {
      updateData["returnPolicy.returnAvailable"] = parseBool(
        updateData.returnAvailable,
        true,
      );
      delete updateData.returnAvailable;
    }
    if (updateData.returnDays !== undefined) {
      updateData["returnPolicy.returnDays"] =
        updateData.returnDays === "" ? 7 : updateData.returnDays;
      delete updateData.returnDays;
    }
    if (updateData.warrantyAvailable !== undefined) {
      updateData["returnPolicy.warrantyAvailable"] = parseBool(
        updateData.warrantyAvailable,
        false,
      );
      delete updateData.warrantyAvailable;
    }
    if (updateData.warrantyDuration !== undefined) {
      updateData["returnPolicy.warrantyDuration"] = updateData.warrantyDuration;
      delete updateData.warrantyDuration;
    }

    if (updateData.taxIncluded !== undefined) {
      updateData["pricing.taxIncluded"] = parseBool(
        updateData.taxIncluded,
        true,
      );
      delete updateData.taxIncluded;
    }
    if (updateData.freeShipping !== undefined) {
      updateData["shipping.freeShipping"] = parseBool(
        updateData.freeShipping,
        false,
      );
      delete updateData.freeShipping;
    }
    if (updateData.adjustable !== undefined) {
      updateData["specifications.adjustable"] = parseBool(
        updateData.adjustable,
        false,
      );
      delete updateData.adjustable;
    }
    if (updateData.hasVariants !== undefined) {
      updateData.hasVariants = parseBool(updateData.hasVariants, false);
    }
    if (updateData.featured !== undefined) {
      updateData["labels.featured"] = parseBool(updateData.featured, false);
      delete updateData.featured;
    }
    if (updateData.trending !== undefined) {
      updateData["labels.trending"] = parseBool(updateData.trending, false);
      delete updateData.trending;
    }
    if (updateData.bestSeller !== undefined) {
      updateData["labels.bestSeller"] = parseBool(updateData.bestSeller, false);
      delete updateData.bestSeller;
    }
    if (updateData.newArrival !== undefined) {
      updateData["labels.newArrival"] = parseBool(updateData.newArrival, false);
      delete updateData.newArrival;
    }
    if (updateData.flashSale !== undefined) {
      updateData["labels.flashSale"] = parseBool(updateData.flashSale, false);
      delete updateData.flashSale;
    }

    delete updateData._id;
    delete updateData.seller;
    delete updateData.sku;
    delete updateData.productSlug;

    const updatedProduct = await JewelleryProduct.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    console.log("✅ Product updated:", updatedProduct.productName);
    console.log(
      "📦 returnPolicy.returnAvailable now:",
      updatedProduct.returnPolicy?.returnAvailable,
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Update product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// ============================================
// DELETE PRODUCT (Soft Delete)
// ============================================
export const deleteProduct = async (req, res) => {
  console.log("✅ deleteProduct called with id:", req.params.id);
  try {
    const seller = req.seller;
    const { id } = req.params;

    if (!seller) {
      console.log("❌ No seller in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const product = await JewelleryProduct.findOne({
      _id: id,
      "seller.sellerId": seller._id,
    });

    if (!product) {
      console.log("❌ Product not found for id:", id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("✅ Product found, archiving:", product.productName);
    product.status = "Archived";
    product.isActive = false;
    await product.save();

    console.log("✅ Product archived successfully");

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
    });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// ============================================
// BULK UPLOAD PRODUCTS (Silver+ Only)
// ============================================
export const bulkUploadProducts = async (req, res) => {
  console.log("✅ bulkUploadProducts called");
  try {
    const seller = req.seller;
    const { products } = req.body;

    console.log("👤 Seller:", seller?._id || "❌ No seller");
    console.log("📦 Products count:", products?.length || 0);

    if (!seller) {
      console.log("❌ No seller in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const plan = await SubscriptionPlan.findOne({
      id: seller.subscriptionPlanId || "free",
    });
    const allowedPlans = ["silver", "gold", "platinum"];

    if (!allowedPlans.includes(plan?.id)) {
      console.log("❌ Bulk upload not allowed for plan:", plan?.id);
      return res.status(403).json({
        success: false,
        message:
          "Bulk upload is only available for Silver, Gold, and Platinum plans",
      });
    }

    if (!Array.isArray(products) || products.length === 0) {
      console.log("❌ No products array provided");
      return res.status(400).json({
        success: false,
        message: "Products array is required",
      });
    }

    const limitStatus = await JewelleryProduct.getProductLimitStatus(
      seller._id,
    );
    if (!limitStatus.isUnlimited && products.length > limitStatus.remaining) {
      console.log(
        "❌ Product limit exceeded:",
        products.length,
        ">",
        limitStatus.remaining,
      );
      return res.status(403).json({
        success: false,
        message: `Cannot upload ${products.length} products. Only ${limitStatus.remaining} slots remaining.`,
      });
    }

    const createdProducts = [];
    const errors = [];

    for (const productData of products) {
      try {
        console.log(
          `📦 Processing product: ${productData.productName || "Unknown"}`,
        );

        if (!productData.productName || !productData.categoryId) {
          errors.push({
            productName: productData.productName || "Unknown",
            error: "Missing required fields: productName, categoryId",
          });
          continue;
        }

        try {
          await validateCategoryFromHeader(
            productData.categoryId,
            productData.subCategoryId,
          );
        } catch (error) {
          errors.push({
            productName: productData.productName,
            error: `Category validation failed: ${error.message}`,
          });
          continue;
        }

        const product = new JewelleryProduct({
          ...productData,
          seller: {
            sellerId: seller._id,
            createdBy: seller._id,
            sellerName: seller.firstName + " " + (seller.lastName || ""),
            sellerEmail: seller.email,
            storeName: seller.storeName || null,
          },
          status: "Draft",
        });

        await product.save();
        createdProducts.push(product);
        console.log(`✅ Product created: ${product.productName}`);
      } catch (error) {
        console.error(
          `❌ Error creating product ${productData.productName || "Unknown"}:`,
          error.message,
        );
        errors.push({
          productName: productData.productName || "Unknown",
          error: error.message,
        });
      }
    }

    console.log(
      `📊 Bulk upload complete: ${createdProducts.length} created, ${errors.length} failed`,
    );

    return res.status(201).json({
      success: true,
      message: `Bulk upload: ${createdProducts.length} created, ${errors.length} failed`,
      data: {
        created: createdProducts,
        errors: errors,
        successCount: createdProducts.length,
        errorCount: errors.length,
      },
    });
  } catch (error) {
    console.error("❌ Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk upload products",
    });
  }
};

// ============================================
// ✅ GET PRODUCTS BY PLACEMENT (Public - Storefront Pages)
// ✅ CHANGED — accepts optional ?lat=&lng= and, when valid + location
// ranking is enabled in Super Admin settings, computes each product's
// distance to its seller's showroom server-side (single aggregation
// pipeline, one $lookup — no N+1) and uses it as the PRIMARY sort key,
// with the caller's chosen sort (latest/price/popular) preserved as the
// tiebreak within each distance zone (Feature 3/15). When no location
// is supplied, behavior is completely unchanged from before.
// ============================================
export const getProductsByPlacement = async (req, res) => {
  console.log(
    "✅ getProductsByPlacement called with placement:",
    req.params.placement,
  );
  try {
    const { placement } = req.params;
    const {
      page = 1,
      limit = 20,
      categoryId,
      collection,
      occasion,
      sort,
      lat,
      lng,
    } = req.query;
    const valid = ["shop", "collections", "gifts", "offers"];

    if (!valid.includes(placement)) {
      console.log("❌ Invalid placement:", placement);
      return res.status(400).json({
        success: false,
        message:
          "Invalid placement. Must be one of: shop, collections, gifts, offers",
      });
    }

    const query = {
      placements: placement,
      status: "Published",
      isActive: true,
    };

    if (categoryId) {
      query["category.categoryId"] = categoryId;
      console.log("📊 Filtering by category:", categoryId);
    }

    if (collection) {
      const escaped = collection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query["specifications.collection"] = new RegExp(`^${escaped}$`, "i");
      console.log("📊 Filtering by collection:", collection);
    }

    if (occasion) {
      const escaped = occasion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query["specifications.occasion"] = new RegExp(`^${escaped}$`, "i");
      console.log("📊 Filtering by occasion:", occasion);
    }

    let baseSort = { createdAt: -1 };
    if (sort === "price-low") baseSort = { "pricing.originalPrice": 1 };
    if (sort === "price-high") baseSort = { "pricing.originalPrice": -1 };
    if (sort === "newest") baseSort = { createdAt: -1 };
    if (sort === "popular") baseSort = { "reviews.totalSold": -1 };

    console.log("📊 Sort option:", baseSort);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ NEW — location-aware ranking
    const userLat = parseCoordinate(lat);
    const userLng = parseCoordinate(lng);
    const hasUserLocation = isValidCoordinate(userLat, userLng);
    const locationSettings = await getLocationSettings();
    const useLocationRanking =
      hasUserLocation && locationSettings.locationRankingEnabled;

    const pipeline = [{ $match: query }];

    if (useLocationRanking) {
      pipeline.push(
        {
          $lookup: {
            from: "sellers",
            localField: "seller.sellerId",
            foreignField: "_id",
            as: "sellerInfo",
          },
        },
        { $unwind: { path: "$sellerInfo", preserveNullAndEmptyArrays: true } },
        ...buildLocationAggregationStages({
          userLat,
          userLng,
          thresholds: locationSettings,
        }),
      );
    }

    const sortStage = useLocationRanking
      ? { zoneRankValue: 1, ...baseSort }
      : baseSort;

    pipeline.push(
      { $sort: sortStage },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $unset: ["pricing.costPrice", "__v", "sellerInfo"] },
    );

    const [products, total] = await Promise.all([
      JewelleryProduct.aggregate(pipeline),
      JewelleryProduct.countDocuments(query),
    ]);

    products.forEach(normalizeReturnPolicy);
    products.forEach(attachLocationInfo);

    console.log(
      `📊 Found ${products.length} products for placement: ${placement}`,
    );
    console.log(`📊 Total products: ${total}`);

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
    console.error("❌ Get products by placement error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get products",
    });
  }
};

// ============================================
// ✅ NEW: GET PLACEMENT COUNTS (Seller Dashboard)
// ============================================
export const getPlacementCounts = async (req, res) => {
  console.log("✅ getPlacementCounts called");
  try {
    const seller = req.seller;

    if (!seller) {
      console.log("❌ No seller in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    console.log("👤 Seller:", seller._id);

    const placements = ["shop", "collections", "gifts", "offers"];
    const counts = {};

    for (const p of placements) {
      counts[p] = await JewelleryProduct.countDocuments({
        "seller.sellerId": seller._id,
        placements: p,
        status: { $ne: "Archived" },
      });
      console.log(`📊 ${p}: ${counts[p]} products`);
    }

    counts.total = await JewelleryProduct.countDocuments({
      "seller.sellerId": seller._id,
      status: { $ne: "Archived" },
    });

    console.log(`📊 Total products: ${counts.total}`);

    return res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error("❌ Get placement counts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get placement counts",
    });
  }
};

// ============================================
// ✅ NEW: GET RELEVANT PRODUCTS (Public - "You May Also Like")
// ============================================
export const getRelevantProducts = async (req, res) => {
  console.log(
    "✅ getRelevantProducts called for productId:",
    req.params.productId,
  );
  try {
    const { productId } = req.params;
    const requestedLimit = parseInt(req.query.limit) || 8;
    const limit = Math.min(Math.max(requestedLimit, 1), 12);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("❌ Invalid productId:", productId);
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const currentProduct = await JewelleryProduct.findById(productId)
      .select("category status isActive")
      .lean();

    if (!currentProduct) {
      console.log("❌ Product not found for id:", productId);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const categoryId = currentProduct.category?.categoryId;
    const subCategoryId = currentProduct.category?.subCategoryId;

    if (!categoryId) {
      console.log("⚠️ Product has no category, returning empty list");
      return res.status(200).json({
        success: true,
        data: { products: [] },
      });
    }

    const selectFields =
      "productName productSlug thumbnail pricing reviews labels category status isActive";

    const seenIds = new Set([currentProduct._id.toString()]);
    const collected = [];

    const addResults = (docs) => {
      for (const doc of docs) {
        const idStr = doc._id.toString();
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          collected.push(doc);
        }
      }
    };

    if (subCategoryId) {
      const subMatches = await JewelleryProduct.find({
        _id: { $ne: currentProduct._id },
        status: "Published",
        isActive: true,
        "category.categoryId": categoryId,
        "category.subCategoryId": subCategoryId,
      })
        .select(selectFields)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      addResults(subMatches);
      console.log(`📊 Step 1 (subcategory) matched: ${subMatches.length}`);
    }

    if (collected.length < limit) {
      const remaining = limit - collected.length;
      const categoryMatches = await JewelleryProduct.find({
        _id: { $nin: Array.from(seenIds) },
        status: "Published",
        isActive: true,
        "category.categoryId": categoryId,
      })
        .select(selectFields)
        .sort({ createdAt: -1 })
        .limit(remaining)
        .lean();
      addResults(categoryMatches);
      console.log(`📊 Step 2 (category) matched: ${categoryMatches.length}`);
    }

    console.log(
      `📊 Total relevant products for ${productId}: ${collected.length}`,
    );

    return res.status(200).json({
      success: true,
      data: { products: collected },
    });
  } catch (error) {
    console.error("❌ Get relevant products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get relevant products",
    });
  }
};

// ============================================
// ✅ NEW: SEARCH PRODUCTS (Public - Header search bar + /shop?search=)
// ✅ CHANGED — accepts optional ?lat=&lng=. Ranking is: (1) relevance
// tier (exact productName substring match beats a match found only via
// another field — Feature 15), then (2) distance zone (when location
// is available and enabled), then (3) the caller's chosen sort as a
// final tiebreak. The regex $and match that determines "is this even a
// result" is completely untouched — location only re-orders results
// that already matched the query.
// ============================================
export const searchProducts = async (req, res) => {
  console.log("✅ searchProducts called with query:", req.query);
  try {
    const rawQuery = (req.query.q ?? req.query.search ?? "").toString();
    const query = rawQuery.trim().replace(/\s+/g, " ");

    const { page = 1, limit = 20, categoryId, sort, lat, lng } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    if (!query) {
      console.log("⚠️ Empty search query — returning empty result set");
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          pagination: {
            page: 1,
            limit: parsedLimit,
            total: 0,
            totalPages: 0,
          },
          query: "",
        },
      });
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const words = query.split(" ").filter(Boolean);

    const wordCondition = (word) => {
      const regex = new RegExp(escapeRegex(word), "i");
      return {
        $or: [
          { productName: regex },
          { brand: regex },
          { shortDescription: regex },
          { fullDescription: regex },
          { "category.categoryData.label": regex },
          { "category.subCategoryData.label": regex },
          { tags: regex },
          { "specifications.collection": regex },
          { "specifications.occasion": regex },
          { "specifications.style": regex },
          { "specifications.material": regex },
          { "specifications.stoneType": regex },
        ],
      };
    };

    const mongoQuery = {
      status: "Published",
      isActive: true,
      $and: words.map(wordCondition),
    };

    if (categoryId) {
      mongoQuery["category.categoryId"] = categoryId;
      console.log("📊 Restricting search to category:", categoryId);
    }

    let baseSort = { createdAt: -1 };
    if (sort === "price-low") baseSort = { "pricing.originalPrice": 1 };
    if (sort === "price-high") baseSort = { "pricing.originalPrice": -1 };
    if (sort === "newest") baseSort = { createdAt: -1 };
    if (sort === "popular") baseSort = { "reviews.totalSold": -1 };

    console.log("🔍 Search Mongo query:", JSON.stringify(mongoQuery));

    const skip = (parsedPage - 1) * parsedLimit;

    const userLat = parseCoordinate(lat);
    const userLng = parseCoordinate(lng);
    const hasUserLocation = isValidCoordinate(userLat, userLng);
    const locationSettings = await getLocationSettings();
    const useLocationRanking =
      hasUserLocation && locationSettings.locationRankingEnabled;

    // ✅ NEW — lightweight relevance tier from the existing regex match:
    // 0 = whole query appears verbatim in productName (strongest signal)
    // 1 = at least one search word appears in productName
    // 2 = matched only via a secondary field (brand/description/etc.)
    const wholeQueryRegex = new RegExp(escapeRegex(query), "i");
    const anyWordInNameOr = words.map((w) => ({
      $regexMatch: {
        input: "$productName",
        regex: new RegExp(escapeRegex(w), "i"),
      },
    }));

    const relevanceStage = {
      $addFields: {
        relevanceTier: {
          $cond: [
            { $regexMatch: { input: "$productName", regex: wholeQueryRegex } },
            0,
            { $cond: [{ $or: anyWordInNameOr }, 1, 2] },
          ],
        },
      },
    };

    const pipeline = [{ $match: mongoQuery }, relevanceStage];

    if (useLocationRanking) {
      pipeline.push(
        {
          $lookup: {
            from: "sellers",
            localField: "seller.sellerId",
            foreignField: "_id",
            as: "sellerInfo",
          },
        },
        { $unwind: { path: "$sellerInfo", preserveNullAndEmptyArrays: true } },
        ...buildLocationAggregationStages({
          userLat,
          userLng,
          thresholds: locationSettings,
        }),
      );
    }

    const sortStage = useLocationRanking
      ? { relevanceTier: 1, zoneRankValue: 1, ...baseSort }
      : { relevanceTier: 1, ...baseSort };

    pipeline.push(
      { $sort: sortStage },
      { $skip: skip },
      { $limit: parsedLimit },
      { $unset: ["pricing.costPrice", "__v", "sellerInfo", "relevanceTier"] },
    );

    const [products, total] = await Promise.all([
      JewelleryProduct.aggregate(pipeline),
      JewelleryProduct.countDocuments(mongoQuery),
    ]);

    products.forEach(normalizeReturnPolicy);
    products.forEach(attachLocationInfo);

    console.log(`📊 Search "${query}" matched ${total} product(s)`);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit),
        },
        query,
      },
    });
  } catch (error) {
    console.error("❌ Search products error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Search failed",
    });
  }
};

console.log("✅ jewelleryProductController fully loaded");
