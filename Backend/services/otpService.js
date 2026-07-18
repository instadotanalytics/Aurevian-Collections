// Backend/services/otpService.js

import twilio from 'twilio';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class OTPService {
  constructor() {
    // Twilio
    try {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    } catch (error) {
      console.log('⚠️ Twilio not configured:', error.message);
    }

    // Nodemailer
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    this.emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  }

  generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  async sendEmailOTP(email, otp, type = 'verification') {
    try {
      const subject = type === 'forgot_password'
        ? 'Reset Your Password - Aurevian Collections'
        : 'Verify Your Email - Aurevian Collections';

      const html = `
        <div style="font-family: Arial; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #c8a86e;">Aurevian Collections</h2>
          <p>Your OTP code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
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
      console.error('❌ Email OTP error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendPhoneOTP(phone, otp) {
    try {
      if (!this.twilioClient) {
        console.log('⚠️ Twilio not available, skipping SMS');
        return { success: false, error: 'Twilio not configured' };
      }

      let phoneNumber = phone.trim();
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+91' + phoneNumber;
      }

      const message = await this.twilioClient.messages.create({
        body: `Your Aurevian OTP is: ${otp}. Valid for 10 minutes.`,
        to: phoneNumber,
        from: this.twilioPhoneNumber,
      });

      return {
        success: true,
        sid: message.sid,
      };
    } catch (error) {
      console.error('❌ Phone OTP error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendOTP(contact, type, otp = null) {
    const generatedOTP = otp || this.generateOTP();

    if (type === 'email') {
      return await this.sendEmailOTP(contact, generatedOTP);
    }
    if (type === 'phone') {
      return await this.sendPhoneOTP(contact, generatedOTP);
    }
    return {
      success: false,
      message: 'Invalid OTP type',
    };
  }

  async storeOTP(user, otp, type = 'email') {
    user.otp = {
      code: otp,
      type: type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
    };
    return await user.save();
  }

  async verifyOTP(user, otp) {
    if (!user.otp || !user.otp.code) {
      return { valid: false, message: 'No OTP found' };
    }
    if (user.otp.code !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }
    if (user.otp.expiresAt < new Date()) {
      return { valid: false, message: 'OTP expired' };
    }
    user.otp.verified = true;
    user.otp.code = undefined;
    user.otp.expiresAt = undefined;
    await user.save();
    return { valid: true, message: 'OTP verified' };
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

  async sendOTPviaSMS(phone, otp) {
    return await this.sendPhoneOTP(phone, otp);
  }
}

export default new OTPService();