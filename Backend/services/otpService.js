import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class OTPService {
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  async sendOTPviaSMS(phone, otp) {
    try {
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        formattedPhone = `+${phone}`;
      }

      // Try Twilio Verify Service
      if (process.env.TWILIO_VERIFY_SERVICE_SID) {
        const verification = await client.verify.v2.services(
          process.env.TWILIO_VERIFY_SERVICE_SID
        ).verifications.create({
          to: formattedPhone,
          channel: 'sms',
        });
        console.log(`✅ SMS sent via Verify: ${verification.sid}`);
      } else {
        // Fallback to manual SMS
        const message = await client.messages.create({
          body: `Your Aurevian Collections verification code is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
          to: formattedPhone,
        });
        console.log(`✅ SMS sent: ${message.sid}`);
      }
      
      console.log(`📱 OTP for ${formattedPhone}: ${otp}`);
      return { success: true };
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      console.log(`📱 Development OTP for ${phone}: ${otp}`);
      return { success: false, error: error.message };
    }
  }

  async storeOTP(user, otp, type = 'email', expiryMinutes = 10) {
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    user.otp = {
      code: otp,
      type: type,
      expiresAt: expiresAt,
      verified: false,
      createdAt: new Date(),
    };
    await user.save();
    return user;
  }

  async verifyOTP(user, otp) {
    if (!user.otp) {
      return { valid: false, message: 'No OTP found' };
    }
    if (user.otp.verified) {
      return { valid: false, message: 'OTP already verified' };
    }
    if (new Date() > user.otp.expiresAt) {
      return { valid: false, message: 'OTP has expired' };
    }
    if (user.otp.code !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }
    user.otp.verified = true;
    await user.save();
    return { valid: true, message: 'OTP verified successfully' };
  }

  async clearOTP(user) {
    user.otp = undefined;
    await user.save();
    return user;
  }
}

export default new OTPService();