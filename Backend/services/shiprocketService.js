// backend/services/shiprocketService.js

const BASE_URL =
  process.env.SHIPROCKET_API_BASE_URL ||
  "https://apiv2.shiprocket.in/v1/external";

const isConfigured = !!(
  process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD
);

if (!isConfigured) {
  console.log(
    "⚠️  Shiprocket credentials not configured — shipping features will fail until SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are set in .env",
  );
} else {
  console.log("✅ Shiprocket service initialized");
}

// ============================================
// CUSTOM ERROR TYPE
// Lets controllers distinguish "client mistake" (4xx, safe to relay)
// from "Shiprocket/network problem" (5xx, never relay raw details)
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
// Shiprocket tokens are documented as valid for ~240 hours (10 days).
// We cache for 9 days and refresh early, plus force-refresh once on any 401.
// ============================================
const TOKEN_LIFETIME_MS = 9 * 24 * 60 * 60 * 1000;
const TOKEN_SAFETY_MARGIN_MS = 6 * 60 * 60 * 1000;

let tokenCache = { token: null, expiresAt: 0 };

export async function generateToken() {
  if (!isConfigured) {
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
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });
  } catch (networkErr) {
    console.error("❌ Shiprocket auth network error:", networkErr.message);
    throw new ShiprocketError("Shiprocket is currently unavailable", 503);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.token) {
    console.error(
      "❌ Shiprocket authentication failed:",
      res.status,
      data?.message || data,
    );
    throw new ShiprocketError(
      "Shiprocket authentication failed — check credentials",
      502,
      data,
    );
  }

  tokenCache = { token: data.token, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
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
// Retries once on 401 by forcing a fresh token (handles unexpected expiry)
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
// body: { shipment_id, courier_id? } — omit courier_id to let Shiprocket
// auto-assign its recommended courier for that shipment.
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
// NOTE: verify the exact response field name (manifest_url vs. a nested
// path) against your Shiprocket Postman collection before depending on it —
// this has been inconsistently documented across sources.
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
// orderIds = array of numeric Shiprocket order IDs (not Aurevian order IDs)
// ============================================
export async function cancelOrder(orderIds) {
  return shiprocketRequest("/orders/cancel", {
    method: "POST",
    body: { ids: orderIds },
  });
}

// ============================================
// RETURN / REVERSE PICKUP
// NOTE: return-order payload fields are less consistently documented than
// the forward-order ones. Test this against a real Shiprocket sandbox/
// account before relying on it — field names (e.g. qc fields) may need
// adjustment based on what your account's dashboard actually expects.
// ============================================
export async function createReturnOrder(payload) {
  return shiprocketRequest("/orders/create/return", {
    method: "POST",
    body: payload,
  });
}

export default {
  isConfigured,
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
  ShiprocketError,
};
