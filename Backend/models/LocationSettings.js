// Backend/models/LocationSettings.js
//
// Single-document config (same "key: active" singleton pattern as
// HeaderConfig), letting Super Admin tune location-ranking behavior
// without a redeploy.

import mongoose from "mongoose";

const locationSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "active", unique: true },

    // Master on/off switch — if false, product/search ordering ignores
    // location entirely, regardless of what the client sends.
    locationRankingEnabled: { type: Boolean, default: true },

    // Distance thresholds in km. Must remain strictly increasing
    // (enforced in the controller): nearby < farther < far.
    nearbyRadiusKm: { type: Number, default: 5, min: 0 },
    fartherRadiusKm: { type: Number, default: 20, min: 0 },
    farRadiusKm: { type: Number, default: 50, min: 0 },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
  },
  { timestamps: true },
);

const LocationSettings = mongoose.model(
  "LocationSettings",
  locationSettingsSchema,
);

export default LocationSettings;
