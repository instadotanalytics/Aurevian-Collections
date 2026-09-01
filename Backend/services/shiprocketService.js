// backend/services/shiprocketService.js

const BASE_URL =
  process.env.SHIPROCKET_API_BASE_URL ||
  "https://apiv2.shiprocket.in/v1/external";

// ✅ CHANGED — was a `const` evaluated once at module import time, which
// meant a process that booted before these vars were populated (or that
// had them injected slightly differently in production) would report
// "not configured" for its entire lifetime, even after the vars were
// confirmed present. This is now a live check, re-evaluated on every
// call, with defensive trimming in case a hosting dashboard's env var
// UI preserved stray whitespace/newlines around a pasted value.
function isShiprocketConfigured() {
  return !!(
    process.env.SHIPROCKET_EMAIL?.trim() &&
    process.env.SHIPROCKET_PASSWORD?.trim()
  );
}

// Kept as a live getter (not a frozen boolean) so `shiprocketService.isConfigured`
// still works exactly as before for any existing callers, but now reflects
// the CURRENT process.env state rather than a snapshot taken at import time.
const shiprocketServiceConfig = {
  get isConfigured() {
    return isShiprocketConfigured();
  },
};

if (!shiprocketServiceConfig.isConfigured) {
  console.log(
    "⚠️  Shiprocket credentials not detected at startup — SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD will be re-checked on each request. If they are added later without a full server restart, some platforms will still pick them up; if not, restart the service.",
  );
} else {
  console.log("✅ Shiprocket service initialized");
}

// ============================================
// CUSTOM ERROR TYPE
// ============================================
export class ShiprocketError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "ShiprocketError";
    this.statusCode = statusCode;
    this.details = details; // never send this to the client — log only
  }
}

// ============================================
// TOKEN CACHE
// ============================================
const TOKEN_LIFETIME_MS = 9 * 24 * 60 * 60 * 1000;
const TOKEN_SAFETY_MARGIN_MS = 6 * 60 * 60 * 1000;

let tokenCache = { token: null, expiresAt: 0 };

export async function generateToken() {
  // ✅ CHANGED — live check instead of the stale module-level const.
  if (!isShiprocketConfigured()) {
    console.error(
      "❌ Shiprocket auth failed: SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD not found in process.env at request time. " +
        `Present: email=${!!process.env.SHIPROCKET_EMAIL} password=${!!process.env.SHIPROCKET_PASSWORD}`,
    );
    throw new ShiprocketError(
      "Shiprocket is not configured on this server",
      500,
    );
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL.trim(),
        password: process.env.SHIPROCKET_PASSWORD.trim(),
      }),
    });
  } catch (networkErr) {
    console.error("❌ Shiprocket auth network error:", networkErr.message);
    throw new ShiprocketError("Shiprocket is currently unavailable", 503);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.token) {
    console.error(
      "❌ Shiprocket authentication FAILED — HTTP",
      res.status,
      "— Response:",
      data,
    );
    throw new ShiprocketError(
      "Shiprocket authentication failed — check credentials",
      502,
      data,
    );
  }

  tokenCache = { token: data.token, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
  console.log("✅ Shiprocket authentication: SUCCESS (new token cached)");
  return data.token;
}

async function getValidToken() {
  if (
    tokenCache.token &&
    Date.now() < tokenCache.expiresAt - TOKEN_SAFETY_MARGIN_MS
  ) {
    return tokenCache.token;
  }
  return generateToken();
}

// ============================================
// GENERIC AUTHENTICATED REQUEST
// ============================================
async function shiprocketRequest(
  path,
  { method = "GET", body } = {},
  _isRetry = false,
) {
  const token = await getValidToken();

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    console.error(
      `❌ Shiprocket network error [${method} ${path}]:`,
      networkErr.message,
    );
    throw new ShiprocketError("Shiprocket is currently unavailable", 503);
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !_isRetry) {
    console.warn(
      `⚠️ Shiprocket returned 401 on [${method} ${path}] — forcing token refresh and retrying once`,
    );
    tokenCache = { token: null, expiresAt: 0 };
    return shiprocketRequest(path, { method, body }, true);
  }

  if (!res.ok) {
    console.error(
      `❌ Shiprocket API error [${method} ${path}]:`,
      res.status,
      data,
    );
    const message =
      data?.message ||
      (data?.errors
        ? "Invalid request to Shiprocket"
        : `Shiprocket API error (${res.status})`);
    throw new ShiprocketError(message, res.status, data);
  }

  return data;
}

// ============================================
// COURIER SERVICEABILITY
// ============================================
export async function checkServiceability({
  pickup_postcode,
  delivery_postcode,
  weight,
  cod = 0,
}) {
  const params = new URLSearchParams({
    pickup_postcode: String(pickup_postcode),
    delivery_postcode: String(delivery_postcode),
    weight: String(weight),
    cod: String(cod),
  });
  return shiprocketRequest(`/courier/serviceability/?${params.toString()}`);
}

// ============================================
// ORDER CREATION
// ============================================
export async function createOrder(payload) {
  return shiprocketRequest("/orders/create/adhoc", {
    method: "POST",
    body: payload,
  });
}

// ============================================
// AWB ASSIGNMENT
// ============================================
export async function assignAWB(body) {
  return shiprocketRequest("/courier/assign/awb", { method: "POST", body });
}

// ============================================
// PICKUP SCHEDULING
// ============================================
export async function schedulePickup(shipmentIds) {
  return shiprocketRequest("/courier/generate/pickup", {
    method: "POST",
    body: { shipment_id: shipmentIds },
  });
}

// ============================================
// LABEL GENERATION
// ============================================
export async function generateLabel(shipmentIds) {
  return shiprocketRequest("/courier/generate/label", {
    method: "POST",
    body: { shipment_id: shipmentIds },
  });
}

// ============================================
// MANIFEST GENERATION
// ============================================
export async function generateManifest(shipmentIds) {
  return shiprocketRequest("/manifests/generate", {
    method: "POST",
    body: { shipment_id: shipmentIds },
  });
}

// ============================================
// TRACKING
// ============================================
export async function trackByAWB(awb) {
  return shiprocketRequest(`/courier/track/awb/${encodeURIComponent(awb)}`);
}

export async function trackByShipmentId(shipmentId) {
  return shiprocketRequest(
    `/courier/track/shipment/${encodeURIComponent(shipmentId)}`,
  );
}

// ============================================
// CANCELLATION
// ============================================
export async function cancelOrder(orderIds) {
  return shiprocketRequest("/orders/cancel", {
    method: "POST",
    body: { ids: orderIds },
  });
}

// ============================================
// RETURN / REVERSE PICKUP
// ============================================
export async function createReturnOrder(payload) {
  return shiprocketRequest("/orders/create/return", {
    method: "POST",
    body: payload,
  });
}

// ============================================
// PICKUP LOCATIONS
// ============================================
export async function getPickupLocations() {
  return shiprocketRequest("/settings/company/pickup");
}

// ============================================
// ✅ NEW: ADD PICKUP LOCATION
// Registers a seller's pickup/warehouse address with Shiprocket under a
// unique nickname (pickup_location). That nickname is what every
// subsequent order-create/return-create payload for that seller
// references — Shiprocket resolves the full address server-side from it.
// Called from sellerController.updateSellerPickupAddress whenever a
// seller saves/changes their pickup address.
// ============================================
export async function addPickupLocation(payload) {
  return shiprocketRequest("/settings/company/addpickup", {
    method: "POST",
    body: payload,
  });
}

export default {
  ...shiprocketServiceConfig, // ✅ CHANGED — spreads the live getter
  generateToken,
  checkServiceability,
  createOrder,
  assignAWB,
  schedulePickup,
  generateLabel,
  generateManifest,
  trackByAWB,
  trackByShipmentId,
  cancelOrder,
  createReturnOrder,
  getPickupLocations,
  addPickupLocation,
  ShiprocketError,
};
