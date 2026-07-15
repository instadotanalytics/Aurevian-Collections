import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.transporter.verify((err, success) => {
      if (err) {
        console.error("❌ Gmail connection failed:", err);
      } else {
        console.log("✅ Gmail transporter is ready");
      }
    });
  }

  async sendEmail({ to, subject, html }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Aurevian Collections" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      });

      console.log("========== EMAIL INFO ==========");
      console.log("Accepted:", info.accepted);
      console.log("Rejected:", info.rejected);
      console.log("Response:", info.response);
      console.log("Message ID:", info.messageId);
      console.log("================================");

      return {
        success: true,
        info,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async sendOTPEmail(to, otp, type = "verification") {
    const subject =
      type === "forgot_password"
        ? "Reset Your Password - Aurevian Collections"
        : "Verify Your Email - Aurevian Collections";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Aurevian Collections</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Luxury Jewellery</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
          <h2 style="color: #333; margin-top: 0;">
            ${type === "forgot_password" ? "Reset Your Password" : "Verify Your Email"}
          </h2>
          <p style="color: #666; line-height: 1.6;">
            ${
              type === "forgot_password"
                ? "We received a request to reset your password. Use the OTP below to proceed."
                : "Welcome to Aurevian Collections! Please verify your email address using the OTP below."
            }
          </p>
          <div style="text-align: center; padding: 20px; margin: 20px 0; background: #f0f4ff; border-radius: 8px; border: 2px dashed #667eea;">
            <h1 style="font-size: 32px; letter-spacing: 10px; color: #333; margin: 0;">${otp}</h1>
            <p style="color: #666; margin: 10px 0 0; font-size: 14px;">Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</p>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendWelcomeEmail(to, name) {
    const subject = "Welcome to Aurevian Collections! ✨";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🎉 Welcome!</h1>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome to Aurevian Collections! We're thrilled to have you on board.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Explore our exclusive collection of luxury jewellery and find the perfect piece for every occasion.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/shop" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: 600;">
              Start Shopping →
            </a>
          </div>
        </div>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  }
}

export default new EmailService();
