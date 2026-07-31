// Backend/services/otpService.js

import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

class OTPService {
  constructor() {
    // Twilio
    try {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    } catch (error) {
      console.log("⚠️ Twilio not configured:", error.message);
    }
    // NOTE: dedicated nodemailer transporter removed here —
    // authController always sends OTP emails via emailService.sendOTPEmail,
    // so this class no longer needs its own Gmail connection.
  }

  // ============================================
  // Generate Email OTP
  // ============================================

  generateOTP(length = 6) {
    let otp = "";

    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }

    return otp;
  }

  // ============================================
  // Send Phone OTP (Twilio Verify)
  // ============================================
  // NOTE: Twilio Verify generates and tracks its own code server-side —
  // it does NOT accept a code you supply. So this must be verified via
  // verifyPhoneOTP() (Twilio's check), not against user.otp.code.

  async sendPhoneOTP(phone) {
    try {
      if (!this.twilioClient) {
        return {
          success: false,
          error: "Twilio not configured",
        };
      }

      let phoneNumber = phone.trim();

      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+91" + phoneNumber;
      }

      const verification = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
        });

      return {
        success: true,
        sid: verification.sid,
        status: verification.status,
      };
    } catch (error) {
      console.error("❌ Phone OTP error:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Verify Phone OTP
  // ============================================

  async verifyPhoneOTP(phone, otp) {
    try {
      if (!this.twilioClient) {
        return false;
      }

      let phoneNumber = phone.trim();

      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+91" + phoneNumber;
      }

      const verification = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: phoneNumber,
          code: otp,
        });

      return verification.status === "approved";
    } catch (error) {
      console.error("❌ Phone Verification Error:", error.message);
      return false;
    }
  }

  // ============================================
  // Store Email OTP
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

  // ============================================
  // Verify Email OTP
  // ============================================

  async verifyOTP(user, otp) {
    if (!user.otp || !user.otp.code) {
      return {
        valid: false,
        message: "No OTP found",
      };
    }

    if (user.otp.code !== otp) {
      return {
        valid: false,
        message: "Invalid OTP",
      };
    }

    if (user.otp.expiresAt < new Date()) {
      return {
        valid: false,
        message: "OTP expired",
      };
    }

    user.otp.verified = true;
    user.otp.code = undefined;
    user.otp.expiresAt = undefined;

    await user.save();

    return {
      valid: true,
      message: "OTP verified",
    };
  }

  // ============================================
  // Clear OTP
  // ============================================

  async clearOTP(user) {
    user.otp = {
      code: undefined,
      type: undefined,
      expiresAt: undefined,
      verified: false,
    };

    return await user.save();
  }

  // ============================================
  // SMS OTP via Twilio Verify (independent of the stored email OTP)
  // ============================================
  async sendOTPviaSMS(phone) {
    return await this.sendPhoneOTP(phone);
  }
}

export default new OTPService();
