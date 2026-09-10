// Backend/utils/geoUtils.js
//
// Centralized geolocation helpers: Haversine distance (both a plain-JS
// version for single-document use, and a MongoDB aggregation-expression
// version for ranking many documents server-side without pulling them
// into Node first), coordinate validation, and zone/threshold logic.
//
// IMPORTANT: coordinates are plain { lat, lng } numbers on Seller.pickupAddress
// (not a GeoJSON Point), so we deliberately do NOT use $geoNear/2dsphere here —
// the aggregation-expression Haversine below is the correct tool for that
// shape and keeps ranking entirely at the database layer.

export const EARTH_RADIUS_KM = 6371;

// ============================================
// VALIDATION
// ============================================
export function isValidCoordinate(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function parseCoordinate(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// ============================================
// PLAIN-JS HAVERSINE — for single-document use (e.g. one product detail
// page, where doing this in JS is simpler than an aggregation pipeline)
// ============================================
export function haversineKm(lat1, lng1, lat2, lng2) {
  if (
    [lat1, lng1, lat2, lng2].some(
      (v) => typeof v !== "number" || !Number.isFinite(v),
    )
  ) {
    return null;
  }
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// ============================================
// ZONE / THRESHOLD LOGIC — configurable via LocationSettings, defaults
// chosen for a single-city/regional jewellery marketplace:
//   0–5km   -> nearby
//   5–20km  -> farther
//   20–50km -> far
//   50km+   -> very_far
// ============================================
export function getZoneForDistance(distanceKm, thresholds) {
  if (distanceKm == null) return "unknown";
  if (distanceKm <= thresholds.nearbyRadiusKm) return "nearby";
  if (distanceKm <= thresholds.fartherRadiusKm) return "farther";
  if (distanceKm <= thresholds.farRadiusKm) return "far";
  return "very_far";
}

export function zoneRank(zone) {
  const order = { nearby: 0, farther: 1, far: 2, very_far: 3, unknown: 4 };
  return order[zone] ?? 4;
}

// User-facing copy — deliberately never blocks, only labels (Feature 6).
export function zoneLabel(zone) {
  const labels = {
    nearby: "Available nearby",
    farther: "",
    far: "Sorry, this product is available farther from your location.",
    very_far: "Sorry, this product is available farther from your location.",
    unknown: "",
  };
  return labels[zone] ?? "";
}

// ============================================
// MONGO AGGREGATION-EXPRESSION HAVERSINE
// Builds a $-expression that computes distance (km) between a fixed
// user coordinate and a field path on the current aggregation document,
// using only long-standing arithmetic/trig operators ($sin/$cos/$atan2/
// $sqrt/$multiply/$subtract/$add/$divide) — no $pow, for broad Mongo
// version compatibility.
// ============================================
export function buildDistanceExpr(userLat, userLng, sellerLatField, sellerLngField) {
  const toRadExpr = (deg) => ({ $multiply: [deg, Math.PI / 180] });
  const lat1 = toRadExpr(userLat);
  const lng1 = toRadExpr(userLng);
  const lat2 = toRadExpr(`$${sellerLatField}`);
  const lng2 = toRadExpr(`$${sellerLngField}`);

  const dLat = { $subtract: [lat2, lat1] };
  const dLng = { $subtract: [lng2, lng1] };

  const sinHalfDLat = { $sin: { $divide: [dLat, 2] } };
  const sinHalfDLng = { $sin: { $divide: [dLng, 2] } };

  const a = {
    $add: [
      { $multiply: [sinHalfDLat, sinHalfDLat] },
      {
        $multiply: [{ $cos: lat1 }, { $cos: lat2 }, sinHalfDLng, sinHalfDLng],
      },
    ],
  };

  const c = {
    $multiply: [2, { $atan2: [{ $sqrt: a }, { $sqrt: { $subtract: [1, a] } }] }],
  };

  return { $multiply: [EARTH_RADIUS_KM, c] };
}

// ============================================
// Full set of aggregation stages that, given a valid user lat/lng and
// the already-$lookup'd+$unwind'd `sellerInfo` field, compute
// `distanceKm`, `locationZone`, and `zoneRankValue` (for sorting) on
// each document. Call this AFTER the $lookup/$unwind stage.
// ============================================
export function buildLocationAggregationStages({ userLat, userLng, thresholds }) {
  const latField = "sellerInfo.pickupAddress.coordinates.lat";
  const lngField = "sellerInfo.pickupAddress.coordinates.lng";
  const distanceExpr = buildDistanceExpr(userLat, userLng, latField, lngField);

  return [
    {
      $addFields: {
        distanceKm: {
          $cond: [
            {
              $and: [
                { $ne: [`$${latField}`, null] },
                { $ne: [`$${lngField}`, null] },
              ],
            },
            distanceExpr,
            null,
          ],
        },
      },
    },
    {
      $addFields: {
        locationZone: {
          $switch: {
            branches: [
              { case: { $eq: ["$distanceKm", null] }, then: "unknown" },
              {
                case: { $lte: ["$distanceKm", thresholds.nearbyRadiusKm] },
                then: "nearby",
              },
              {
                case: { $lte: ["$distanceKm", thresholds.fartherRadiusKm] },
                then: "farther",
              },
              {
                case: { $lte: ["$distanceKm", thresholds.farRadiusKm] },
                then: "far",
              },
            ],
            default: "very_far",
          },
        },
        zoneRankValue: {
          $switch: {
            branches: [
              { case: { $eq: ["$distanceKm", null] }, then: 4 },
              {
                case: { $lte: ["$distanceKm", thresholds.nearbyRadiusKm] },
                then: 0,
              },
              {
                case: { $lte: ["$distanceKm", thresholds.fartherRadiusKm] },
                then: 1,
              },
              {
                case: { $lte: ["$distanceKm", thresholds.farRadiusKm] },
                then: 2,
              },
            ],
            default: 3,
          },
        },
      },
    },
  ];
}