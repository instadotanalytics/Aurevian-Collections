// Backend/controllers/locationSettingsController.js
//
// Super Admin: location ranking settings (thresholds, on/off) + a
// privacy-safe overview of location coverage. Never returns raw user
// coordinates (none are stored server-side for users at all — see
// Feature 9/13), and only returns seller coordinates here because this
// is the Super Admin surface, which already sees full seller records
// elsewhere (bank details, documents, etc.).

import LocationSettings from "../models/LocationSettings.js";
import Seller from "../models/Seller.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import {
  getLocationSettings,
  invalidateLocationSettingsCache,
} from "../services/locationSettingsService.js";

// ============================================
// GET /api/super-admin/location/settings
// ============================================
export const getLocationSettingsAdmin = async (req, res) => {
  try {
    const settings = await getLocationSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch location settings",
      error: error.message,
    });
  }
};

// ============================================
// PUT /api/super-admin/location/settings
// ============================================
export const updateLocationSettingsAdmin = async (req, res) => {
  try {
    const {
      locationRankingEnabled,
      nearbyRadiusKm,
      fartherRadiusKm,
      farRadiusKm,
    } = req.body;

    const updates = {};
    if (typeof locationRankingEnabled === "boolean") {
      updates.locationRankingEnabled = locationRankingEnabled;
    }

    const numOrUndefined = (v) =>
      v === undefined || v === null || v === "" ? undefined : Number(v);

    const n1 = numOrUndefined(nearbyRadiusKm);
    const n2 = numOrUndefined(fartherRadiusKm);
    const n3 = numOrUndefined(farRadiusKm);

    if (n1 !== undefined) {
      if (!Number.isFinite(n1) || n1 < 0) {
        return res.status(400).json({
          success: false,
          message: "nearbyRadiusKm must be a non-negative number",
        });
      }
      updates.nearbyRadiusKm = n1;
    }
    if (n2 !== undefined) {
      if (!Number.isFinite(n2) || n2 < 0) {
        return res.status(400).json({
          success: false,
          message: "fartherRadiusKm must be a non-negative number",
        });
      }
      updates.fartherRadiusKm = n2;
    }
    if (n3 !== undefined) {
      if (!Number.isFinite(n3) || n3 < 0) {
        return res.status(400).json({
          success: false,
          message: "farRadiusKm must be a non-negative number",
        });
      }
      updates.farRadiusKm = n3;
    }

    const current = await LocationSettings.findOne({ key: "active" });
    const merged = {
      nearbyRadiusKm: updates.nearbyRadiusKm ?? current?.nearbyRadiusKm ?? 5,
      fartherRadiusKm:
        updates.fartherRadiusKm ?? current?.fartherRadiusKm ?? 20,
      farRadiusKm: updates.farRadiusKm ?? current?.farRadiusKm ?? 50,
    };

    if (
      !(
        merged.nearbyRadiusKm < merged.fartherRadiusKm &&
        merged.fartherRadiusKm < merged.farRadiusKm
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Thresholds must be strictly increasing: nearby < farther < far",
      });
    }

    updates.updatedBy = req.admin?._id || null;

    const settings = await LocationSettings.findOneAndUpdate(
      { key: "active" },
      { $set: updates },
      { new: true, upsert: true },
    );

    invalidateLocationSettingsCache();

    return res.status(200).json({
      success: true,
      message: "Location settings updated",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update location settings",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/super-admin/location/overview
// Aggregate counts only — never raw coordinates.
// ============================================
export const getLocationOverviewAdmin = async (req, res) => {
  try {
    const [sellersWithLocation, totalSellers] = await Promise.all([
      Seller.countDocuments({
        "pickupAddress.coordinates.lat": { $ne: null },
        "pickupAddress.coordinates.lng": { $ne: null },
      }),
      Seller.countDocuments({}),
    ]);
    const sellersWithoutLocation = totalSellers - sellersWithLocation;

    const sellerIdsWithLocation = await Seller.find({
      "pickupAddress.coordinates.lat": { $ne: null },
      "pickupAddress.coordinates.lng": { $ne: null },
    }).distinct("_id");

    const [productsWithLocationRanking, totalPublishedProducts] =
      await Promise.all([
        JewelleryProduct.countDocuments({
          status: "Published",
          isActive: true,
          "seller.sellerId": { $in: sellerIdsWithLocation },
        }),
        JewelleryProduct.countDocuments({
          status: "Published",
          isActive: true,
        }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        sellersWithLocation,
        sellersWithoutLocation,
        totalSellers,
        productsWithLocationRanking,
        totalPublishedProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch location overview",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/super-admin/location/sellers
// Lightweight, location-focused seller projection for the Location
// Settings page's "Sellers & Showrooms" table. The full seller
// management UI already exists at /super-admin/sellers.
// ============================================
export const getSellersLocationStatusAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, onlyMissing } = req.query;
    const query = {};
    if (onlyMissing === "true") {
      query.$or = [
        { "pickupAddress.coordinates.lat": null },
        { "pickupAddress.coordinates.lat": { $exists: false } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .select(
          "fullName storeInfo.storeName pickupAddress.city pickupAddress.state pickupAddress.coordinates",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Seller.countDocuments(query),
    ]);

    const data = sellers.map((s) => ({
      _id: s._id,
      sellerName: s.fullName,
      storeName: s.storeInfo?.storeName || null,
      showroomCity: s.pickupAddress?.city || null,
      showroomState: s.pickupAddress?.state || null,
      latitude: s.pickupAddress?.coordinates?.lat ?? null,
      longitude: s.pickupAddress?.coordinates?.lng ?? null,
      locationConfigured: !!(
        s.pickupAddress?.coordinates?.lat != null &&
        s.pickupAddress?.coordinates?.lng != null
      ),
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller location status",
      error: error.message,
    });
  }
};
