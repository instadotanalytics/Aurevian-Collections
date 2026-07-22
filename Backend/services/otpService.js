// Backend/services/otpService.js

import twilio from "twilio";
import nodemailer from "nodemailer";
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

    // Nodemailer
    this.emailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
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
  // Send Email OTP
  // ============================================

  async sendEmailOTP(email, otp, type = "verification") {
    try {
      const subject =
        type === "forgot_password"
          ? "Reset Your Password - Aurevian Collections"
          : "Verify Your Email - Aurevian Collections";

      const html = `
      <div style="font-family:Arial;padding:20px">
        <h2>Aurevian Collections</h2>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing:6px">${otp}</h1>

        <p>This OTP expires in 10 minutes.</p>
      </div>
      `;

      const info = await this.emailTransporter.sendMail({
        from: this.emailFrom,
        to: email,
        subject,
        html,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("❌ Email OTP error:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Send Phone OTP (Twilio Verify)
  // ============================================

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
  // Common Sender
  // ============================================

  async sendOTP(contact, type, otp = null) {
    const generatedOTP = otp || this.generateOTP();

    if (type === "email") {
      return await this.sendEmailOTP(contact, generatedOTP);
    }

    if (type === "phone") {
      return await this.sendPhoneOTP(contact);
    }

    return {
      success: false,
      message: "Invalid OTP type",
    };
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

  async sendOTPviaSMS(phone) {
    return await this.sendPhoneOTP(phone);
  }
}

export default new OTPService();
