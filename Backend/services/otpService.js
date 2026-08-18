// Backend/services/otpService.js

import twilio from "twilio";
import dotenv from "dotenv";
import { normalizePhoneNumber } from "../utils/phoneUtils.js";

dotenv.config();

// ============================================
// Twilio error classification — distinguishes
// account restrictions / invalid input / provider
// failure so the controller can respond safely.
// ============================================
const TWILIO_ERROR_MAP = {
  21608: {
    code: "TRIAL_UNVERIFIED",
    message:
      "This number isn't verified with the SMS provider (trial account restriction).",
  },
  21211: { code: "INVALID_NUMBER", message: "The phone number is invalid." },
  21614: {
    code: "INVALID_NUMBER",
    message: "The phone number is not a valid mobile number.",
  },
  20003: { code: "AUTH_ERROR", message: "SMS provider authentication failed." },
  60200: { code: "INVALID_NUMBER", message: "The phone number is invalid." },
  60203: {
    code: "RATE_LIMITED",
    message: "Too many OTP attempts for this number. Try again later.",
  },
  60212: { code: "RATE_LIMITED", message: "Too many concurrent OTP requests." },
};

function classifyTwilioError(error) {
  const mapped = TWILIO_ERROR_MAP[error?.code];
  if (mapped) return mapped;

  // Fallback: sniff the message for the trial-account restriction, since
  // it's occasionally surfaced without the numeric code attached.
  if (
    typeof error?.message === "string" &&
    error.message.toLowerCase().includes("trial account")
  ) {
    return {
      code: "TRIAL_UNVERIFIED",
      message:
        "This number isn't verified with the SMS provider (trial account restriction).",
    };
  }

  return {
    code: "PROVIDER_ERROR",
    message: "Failed to send SMS OTP. Please try again.",
  };
}

class OTPService {
  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // ✅ Config validation up front — a missing var should fail loudly at
    // startup, not surface as a confusing runtime Twilio SDK error later.
    if (!sid || !authToken || !verifyServiceSid) {
      console.error(
        "❌ [SMS OTP] Twilio not fully configured — missing " +
          [
            !sid && "TWILIO_ACCOUNT_SID",
            !authToken && "TWILIO_AUTH_TOKEN",
            !verifyServiceSid && "TWILIO_VERIFY_SERVICE_SID",
          ]
            .filter(Boolean)
            .join(", "),
      );
      this.twilioClient = null;
      this.configured = false;
      return;
    }

    try {
      this.twilioClient = twilio(sid, authToken);
      this.configured = true;
      console.log("✅ [SMS OTP] Twilio client initialized");
    } catch (error) {
      console.log("⚠️ [SMS OTP] Twilio not configured:", error.message);
      this.twilioClient = null;
      this.configured = false;
    }
  }

  generateOTP(length = 6) {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  // ============================================
  // Send Phone OTP (Twilio Verify)
  // Twilio Verify generates and tracks its own code server-side — it does
  // NOT accept a code you supply. Verify via verifyPhoneOTP() (Twilio's
  // check), not against a locally stored OTP.
  // ============================================
  async sendPhoneOTP(phone) {
    // ✅ Validate + normalize BEFORE ever touching Twilio — invalid input
    // should never generate a provider request.
    const { valid, e164, reason } = normalizePhoneNumber(phone);
    if (!valid) {
      console.error(
        "❌ [SMS OTP] Rejected invalid phone number before Twilio call:",
        reason,
      );
      return { success: false, code: "INVALID_NUMBER", error: reason };
    }

    if (!this.configured || !this.twilioClient) {
      console.error("❌ [SMS OTP] Send skipped — Twilio is not configured.");
      return {
        success: false,
        code: "NOT_CONFIGURED",
        error: "SMS service is not configured",
      };
    }

    try {
      const verification = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: e164, channel: "sms" });

      return {
        success: true,
        sid: verification.sid,
        status: verification.status,
      };
    } catch (error) {
      const classified = classifyTwilioError(error);

      // ✅ Log enough to debug, never the credentials, never the OTP.
      if (classified.code === "TRIAL_UNVERIFIED") {
        console.error(
          `[SMS OTP] Twilio rejected destination because the account is a trial account ` +
            `and the destination is unverified. (destination redacted)`,
        );
      } else {
        console.error("❌ [SMS OTP] Twilio send failed:", {
          classification: classified.code,
          twilioCode: error?.code,
          twilioStatus: error?.status,
        });
      }

      return {
        success: false,
        code: classified.code,
        error: classified.message,
      };
    }
  }

  // ============================================
  // Verify Phone OTP
  // ============================================
  async verifyPhoneOTP(phone, otp) {
    const { valid, e164 } = normalizePhoneNumber(phone);
    if (!valid) return false;

    if (!this.configured || !this.twilioClient) return false;

    try {
      const verification = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: e164, code: otp });

      return verification.status === "approved";
    } catch (error) {
      const classified = classifyTwilioError(error);
      console.error("❌ [SMS OTP] Verification check failed:", {
        classification: classified.code,
      });
      return false;
    }
  }

  // ============================================
  // Store / Verify / Clear Email OTP (unchanged — email flow untouched)
  // ============================================
  async storeOTP(user, otp, type = "email") {
    user.otp = {
      code: otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
    };
    return await user.save();
  }

  async verifyOTP(user, otp) {
    if (!user.otp || !user.otp.code)
      return { valid: false, message: "No OTP found" };
    if (user.otp.code !== otp) return { valid: false, message: "Invalid OTP" };
    if (user.otp.expiresAt < new Date())
      return { valid: false, message: "OTP expired" };

    user.otp.verified = true;
    user.otp.code = undefined;
    user.otp.expiresAt = undefined;
    await user.save();

    return { valid: true, message: "OTP verified" };
  }

  async clearOTP(user) {
    user.otp = {
      code: undefined,
      type: undefined,
      expiresAt: undefined,
      verified: false,
    };
    return await user.save();
  }

  async sendOTPviaSMS(phone) {
    return await this.sendPhoneOTP(phone);
  }
}

export default new OTPService();
