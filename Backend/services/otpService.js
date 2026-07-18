import twilio from "twilio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class OTPService {
  constructor() {
    // ============================================
    // TWILIO
    // ============================================
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // ============================================
    // NODEMAILER
    // ============================================
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
  // GENERATE OTP
  // ============================================

  generateOTP(length = 6) {
    let otp = "";

    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }

    return otp;
  }

  // ============================================
  // EMAIL OTP
  // ============================================

  async sendEmailOTP(email, otp, type = "verification") {
    try {
      const subject =
        type === "forgot_password"
          ? "Reset Password - Aurevian Collections"
          : "Verify Your Email - Aurevian Collections";

      const html = `
      <div style="font-family:Arial;padding:30px;background:#f5f5f5">
        <div style="max-width:600px;background:white;padding:30px;margin:auto;border-radius:10px">
          <h2>Aurevian Collections</h2>

          <p>Your OTP is:</p>

          <h1 style="letter-spacing:8px">
            ${otp}
          </h1>

          <p>This OTP will expire in 10 minutes.</p>
        </div>
      </div>
      `;

      const info = await this.emailTransporter.sendMail({
        from: this.emailFrom,
        to: email,
        subject,
        html,
      });

      console.log("Accepted:", info.accepted);
      console.log("Rejected:", info.rejected);
      console.log("Response:", info.response);

      console.log("✅ Email OTP sent:", email);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err) {
      console.error("❌ Email OTP Error:", err);

      return {
        success: false,
        error: err.message,
      };
    }
  }

  // ============================================
  // PHONE OTP
  // ============================================

  async sendPhoneOTP(phone) {
    try {
      let phoneNumber = phone.trim();

      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+91" + phoneNumber;
      }

      const response = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
        });

      console.log("✅ Phone OTP sent:", response.sid);

      return {
        success: true,
        sid: response.sid,
      };
    } catch (err) {
      console.error("❌ Phone OTP Error:", err);

      return {
        success: false,
        error: err.message,
      };
    }
  }

  // ============================================
  // VERIFY PHONE OTP
  // ============================================

  async verifyPhoneOTP(phone, otp) {
    try {
      let phoneNumber = phone.trim();

      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+91" + phoneNumber;
      }

      const result = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: phoneNumber,
          code: otp,
        });

      return result.status === "approved";
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  // ============================================
  // SEND OTP
  // ============================================

  async sendOTP(contact, type, otp = null) {
    const generatedOTP = otp || this.generateOTP();

    if (type === "email") {
      return await this.sendEmailOTP(contact, generatedOTP);
    }

    if (type === "phone") {
      // Verify API generates the SMS itself.
      return await this.sendPhoneOTP(contact);
    }

    return {
      success: false,
      message: "Invalid OTP type",
    };
  }
}

export default new OTPService();