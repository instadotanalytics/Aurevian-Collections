// backend/services/supportEmailService.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================
// SEND AUTO-REPLY TO USER
// ============================================
export const sendAutoReply = async (name, email, subject, ticketId) => {
  try {
    const mailOptions = {
      from: `"Aurevian Collections Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ We've received your query - Ticket #${ticketId}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✨ Aurevian Collections</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Premium Jewellery</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${name} 👋</h2>
            
            <p style="color: #475569; line-height: 1.8; font-size: 15px;">
              Thank you for contacting <strong>Aurevian Collections</strong>. We have received your query and our support team will get back to you within <strong style="color: #4F46E5;">24 hours</strong>.
            </p>
            
            <div style="background: #f1f5f9; padding: 18px; border-radius: 10px; border-left: 4px solid #4F46E5; margin: 25px 0;">
              <p style="margin: 0; color: #1e293b; font-weight: 600;">📝 Ticket Details</p>
              <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-size: 14px; width: 120px;">Ticket ID</td>
                  <td style="padding: 5px 0; color: #1e293b; font-weight: 600; font-size: 14px;">#${ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-size: 14px;">Subject</td>
                  <td style="padding: 5px 0; color: #1e293b; font-size: 14px;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-size: 14px;">Status</td>
                  <td style="padding: 5px 0; color: #f59e0b; font-weight: 600; font-size: 14px;">🟡 Pending</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-size: 14px;">Submitted</td>
                  <td style="padding: 5px 0; color: #1e293b; font-size: 14px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef9e7; padding: 18px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #1e293b; font-weight: 600;">📌 What's Next?</p>
              <ul style="color: #475569; line-height: 2; font-size: 14px; padding-left: 20px; margin: 8px 0 0 0;">
                <li>Our team will review your query</li>
                <li>You'll receive a response via email</li>
                <li>Check ticket status in your account</li>
              </ul>
            </div>
            
            <div style="margin: 25px 0; text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                🕐 We reply within 24 hours (Mon-Sat, 10AM - 7PM IST)
              </p>
            </div>
            
            <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 25px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                This is an automated response. Please do not reply to this email.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">
                © ${new Date().getFullYear()} Aurevian Collections. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Auto-reply sent to ${email} for ticket #${ticketId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending auto-reply:", error);
    return false;
  }
};

// ============================================
// SEND REPLY TO USER
// ============================================
export const sendReplyEmail = async (to, name, ticketId, subject, replyMessage) => {
  try {
    const mailOptions = {
      from: `"Aurevian Collections Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `💬 Re: ${subject} - Ticket #${ticketId}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✨ Aurevian Collections</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Premium Jewellery</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${name} 👋</h2>
            <p style="color: #475569; line-height: 1.8; font-size: 15px;">
              Your support ticket <strong style="color: #4F46E5;">#${ticketId}</strong> has received a reply from our support team.
            </p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #22c55e; margin: 25px 0;">
              <p style="margin: 0; color: #1e293b; font-weight: 600;">💬 Support Reply:</p>
              <div style="margin: 10px 0 0 0; color: #334155; line-height: 1.8; font-size: 15px; white-space: pre-wrap;">
                ${replyMessage}
              </div>
            </div>
            
            <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; border-left: 4px solid #4F46E5; margin: 20px 0;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                📌 <strong>Ticket ID:</strong> #${ticketId} &nbsp;|&nbsp; 
                <strong>Status:</strong> <span style="color: #f59e0b; font-weight: 600;">In Progress</span>
              </p>
            </div>
            
            <div style="background: #eff6ff; padding: 18px; border-radius: 10px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <p style="margin: 0; color: #1e293b; font-weight: 600;">💡 Need More Help?</p>
              <p style="margin: 5px 0 0 0; color: #475569; font-size: 14px;">
                You can reply directly to this email or log in to your account to continue the conversation.
              </p>
            </div>
            
            <div style="margin: 25px 0; text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                🕐 We're here to help! (Mon-Sat, 10AM - 7PM IST)
              </p>
            </div>
            
            <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 25px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Aurevian Collections. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reply email sent to ${to} for ticket #${ticketId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending reply email:", error);
    return false;
  }
};

// ============================================
// SEND RESOLVED EMAIL
// ============================================
export const sendResolvedEmail = async (to, name, ticketId, subject) => {
  try {
    const mailOptions = {
      from: `"Aurevian Collections Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `✅ Your query has been resolved - Ticket #${ticketId}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ Ticket Resolved</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Aurevian Collections</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${name} 👋</h2>
            <p style="color: #475569; line-height: 1.8; font-size: 15px;">
              We're happy to inform you that your support ticket <strong style="color: #22c55e;">#${ticketId}</strong> has been resolved.
            </p>
            
            <div style="background: #f0fdf4; padding: 18px; border-radius: 10px; border-left: 4px solid #22c55e; margin: 25px 0;">
              <p style="margin: 0; color: #1e293b; font-weight: 600;">✅ Resolution Status</p>
              <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px;">
                Your issue has been successfully resolved. If you have any further questions, feel free to reply to this email.
              </p>
            </div>
            
            <div style="background: #fef9e7; padding: 18px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #1e293b; font-weight: 600;">💡 Did we help you?</p>
              <p style="margin: 5px 0 0 0; color: #475569; font-size: 14px;">
                We'd love to hear your feedback. Your opinion helps us improve!
              </p>
            </div>
            
            <div style="margin: 25px 0; text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                🕐 Need help again? We're here for you! (Mon-Sat, 10AM - 7PM IST)
              </p>
            </div>
            
            <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 25px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Aurevian Collections. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Resolved email sent to ${to} for ticket #${ticketId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending resolved email:", error);
    return false;
  }
};

// ============================================
// SEND TICKET CLOSED EMAIL
// ============================================
export const sendClosedEmail = async (to, name, ticketId, subject) => {
  try {
    const mailOptions = {
      from: `"Aurevian Collections Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `📌 Your ticket has been closed - Ticket #${ticketId}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📌 Ticket Closed</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Aurevian Collections</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${name} 👋</h2>
            <p style="color: #475569; line-height: 1.8; font-size: 15px;">
              Your support ticket <strong style="color: #6b7280;">#${ticketId}</strong> has been closed.
            </p>
            
            <div style="background: #f3f4f6; padding: 18px; border-radius: 10px; border-left: 4px solid #6b7280; margin: 25px 0;">
              <p style="margin: 0; color: #1e293b; font-size: 14px;">
                If you need further assistance, please create a new ticket and we'll be happy to help!
              </p>
            </div>
            
            <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 25px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Aurevian Collections. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Closed email sent to ${to} for ticket #${ticketId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending closed email:", error);
    return false;
  }
};

// ============================================
// SEND ADMIN NOTIFICATION
// ============================================
export const sendAdminNotification = async (adminEmail, ticketId, name, subject) => {
  try {
    const mailOptions = {
      from: `"Aurevian Collections Support" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 New Support Ticket - #${ticketId}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Ticket Alert</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h3 style="color: #1e293b;">New Support Ticket Created</h3>
            
            <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 120px;">Ticket ID</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">#${ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Customer</td>
                  <td style="padding: 8px 0; color: #1e293b;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Subject</td>
                  <td style="padding: 8px 0; color: #1e293b;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Time</td>
                  <td style="padding: 8px 0; color: #1e293b;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:5173'}/admin/support/${ticketId}" 
                 style="background: #4F46E5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block;">
                View Ticket
              </a>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification sent for ticket #${ticketId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
    return false;
  }
};

// ============================================
// TEST EMAIL CONNECTION
// ============================================
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready");
    return true;
  } catch (error) {
    console.error("❌ Email service error:", error);
    return false;
  }
};

export default {
  sendAutoReply,
  sendReplyEmail,
  sendResolvedEmail,
  sendClosedEmail,
  sendAdminNotification,
  testEmailConnection,
};