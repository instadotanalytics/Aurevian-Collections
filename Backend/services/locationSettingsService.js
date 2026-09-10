// Backend/services/locationSettingsService.js

import LocationSettings from "../models/LocationSettings.js";

let cache = null;
let cacheAt = 0;
const CACHE_TTL_MS = 60 * 1000; // short cache — admin changes apply within a minute

export const initializeLocationSettings = async () => {
  try {
    const existing = await LocationSettings.findOne({ key: "active" });
    if (!existing) {
      await LocationSettings.create({ key: "active" });
      console.log("✅ Seeded default location settings");
    }
  } catch (error) {
    console.error("❌ Failed to seed location settings:", error.message);
  }
};

export const getLocationSettings = async () => {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) return cache;

  let doc = await LocationSettings.findOne({ key: "active" }).lean();
  if (!doc) {
    const created = await LocationSettings.create({ key: "active" });
    doc = created.toObject();
  }
  cache = doc;
  cacheAt = now;
  return doc;
};

export const invalidateLocationSettingsCache = () => {
  cache = null;
};
