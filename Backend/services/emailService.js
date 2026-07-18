// Backend/services/emailService.js

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
      console.error("❌ Email error:", err);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  // ============================================
  // OTP EMAILS
  // ============================================

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

  // ============================================
  // WELCOME EMAIL
  // ============================================

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

  // ============================================
  // SELLER APPROVAL EMAIL (24 Hours Verification)
  // ============================================

  async sendSellerApprovalEmail(to, name, storeName, loginLink) {
    const subject = '📋 Seller Account Under Review - Aurevian Collections';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seller Account Under Review</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8f6f4; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
          .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 10px; }
          .message { color: #666; line-height: 1.8; margin-bottom: 20px; }
          .info-box { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .info-box h3 { margin: 0 0 10px; color: #333; }
          .info-box ul { margin: 10px 0 0; padding-left: 20px; color: #555; }
          .info-box li { margin: 8px 0; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; border-top: 1px solid #eee; }
          .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .btn:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Account Under Review</h1>
            <p>Your Seller Application is Being Verified</p>
          </div>
          <div class="content">
            <p class="greeting">Dear ${name},</p>
            <p class="message">
              Thank you for registering as a seller on <strong>Aurevian Collections</strong>!
            </p>
            <p class="message">
              We have received your application for <strong>"${storeName}"</strong> and our team is currently reviewing your documents and KYC details.
            </p>
            
            <div class="info-box">
              <h3>⏳ What happens next?</h3>
              <ul>
                <li><strong>Within 24 hours:</strong> Our team will review your application</li>
                <li><strong>Verification:</strong> We will verify your PAN, Aadhaar, and business documents</li>
                <li><strong>Approval Email:</strong> You will receive a confirmation email once approved</li>
                <li><strong>Start Selling:</strong> After approval, you can login and start selling</li>
              </ul>
            </div>

            <p style="color: #666; margin: 20px 0;">
              If you have any questions, please contact our support team.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" class="btn">Login to Check Status →</a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
              You will receive another email once your account is approved.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aurevian Collections. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // ============================================
  // SELLER APPROVED EMAIL
  // ============================================

  async sendSellerApprovedEmail(to, name, storeName, loginLink) {
    const subject = '🎉 Seller Account Approved - Aurevian Collections';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seller Account Approved</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8f6f4; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
          .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 10px; }
          .message { color: #666; line-height: 1.8; margin-bottom: 20px; }
          .btn { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
          .btn:hover { background: #059669; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; border-top: 1px solid #eee; }
          .highlight-box { background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #a7f3d0; }
          .highlight-box li { color: #065f46; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your Seller Account is Approved</p>
          </div>
          <div class="content">
            <p class="greeting">Dear ${name},</p>
            <p class="message">
              Great news! Your seller application for <strong>"${storeName}"</strong> has been <strong style="color: #10B981;">approved</strong>!
            </p>
            <div class="highlight-box">
              <p style="margin: 0; color: #065f46; font-weight: 600;">✅ What's next?</p>
              <ul style="margin: 10px 0 0; padding-left: 20px;">
                <li>Login to your seller dashboard</li>
                <li>Start adding your products</li>
                <li>Manage your orders</li>
                <li>Track your sales and revenue</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" class="btn">Go to Dashboard →</a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
              Start selling and grow your business with Aurevian Collections!
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aurevian Collections. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // ============================================
  // SELLER REJECTED EMAIL
  // ============================================

  async sendSellerRejectedEmail(to, name, storeName, reason) {
    const subject = 'Seller Account Update - Aurevian Collections';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seller Account Update</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8f6f4; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
          .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 10px; }
          .message { color: #666; line-height: 1.8; margin-bottom: 20px; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Update</h1>
            <p>Seller Application Status</p>
          </div>
          <div class="content">
            <p class="greeting">Dear ${name},</p>
            <p class="message">
              We have reviewed your seller application for <strong>"${storeName}"</strong>.
            </p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fca5a5;">
              <p style="margin: 0; color: #991b1b; font-weight: 600;">❌ Status: Rejected</p>
              ${reason ? `<p style="margin: 10px 0 0; color: #991b1b; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            <p style="color: #666; line-height: 1.6;">
              You can reapply with corrected information after addressing the above issues.
            </p>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aurevian Collections. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // ============================================
  // SELLER SUSPENDED EMAIL
  // ============================================

  async sendSellerSuspendedEmail(to, name, storeName, reason) {
    const subject = '⚠️ Account Suspended - Aurevian Collections';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Suspended</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8f6f4; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
          .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 10px; }
          .message { color: #666; line-height: 1.8; margin-bottom: 20px; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Account Suspended</h1>
            <p>Action Required</p>
          </div>
          <div class="content">
            <p class="greeting">Dear ${name},</p>
            <p class="message">
              Your seller account for <strong>"${storeName}"</strong> has been <strong style="color: #F59E0B;">suspended</strong>.
            </p>
            <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Reason:</p>
              <p style="margin: 10px 0 0; color: #92400e;">${reason || 'Violation of terms and conditions'}</p>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Please contact our support team for more information and to resolve this issue.
            </p>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
              We're here to help you get back on track.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aurevian Collections. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

export default new EmailService();