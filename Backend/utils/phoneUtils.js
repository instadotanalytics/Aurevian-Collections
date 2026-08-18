// Backend/utils/phoneUtils.js
// Centralized E.164 phone normalization + validation, shared by
// registration and resend-OTP so Twilio always gets one consistent format.

const DEFAULT_COUNTRY_CODE = "91"; // matches the project's existing Twilio/India OTP flow

/**
 * Normalizes user-entered phone input into E.164.
 * Accepts: "8889458981", "08889458981", "+918889458981", "91 8889458981", "91-8889458981"
 * Does NOT blindly prepend +91 — only applies it when the number has no
 * country code at all (bare 10-digit local number).
 *
 * @returns {{ valid: boolean, e164: string|null, reason?: string }}
 */
export function normalizePhoneNumber(
  rawPhone,
  defaultCountryCode = DEFAULT_COUNTRY_CODE,
) {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { valid: false, e164: null, reason: "Phone number is required" };
  }

  let cleaned = rawPhone.trim().replace(/[\s\-().]/g, "");

  // Already E.164
  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1);
    if (!/^\d{8,15}$/.test(digits)) {
      return {
        valid: false,
        e164: null,
        reason: "Invalid phone number format",
      };
    }
    return { valid: true, e164: `+${digits}` };
  }

  // Strip leading zeros (local dialing prefix, e.g. "08889458981")
  cleaned = cleaned.replace(/^0+/, "");

  // Already has the country code but no "+" (e.g. "918889458981")
  if (
    cleaned.startsWith(defaultCountryCode) &&
    cleaned.length === defaultCountryCode.length + 10
  ) {
    return { valid: true, e164: `+${cleaned}` };
  }

  // Bare 10-digit local number — apply the project's default country code
  if (/^\d{10}$/.test(cleaned)) {
    return { valid: true, e164: `+${defaultCountryCode}${cleaned}` };
  }

  return {
    valid: false,
    e164: null,
    reason: "Unrecognized phone number format",
  };
}
