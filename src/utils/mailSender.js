// utils/mailSender.js
import crypto from 'crypto';
import { createTransport } from 'nodemailer';
import { User } from '../models/user.model.js';
import dotenv from "dotenv";
dotenv.config();

const TOKEN_EXPIRY_MS = 1000 * 60 * 10;

// Sends through Brevo's HTTPS API. Hosts that block outbound SMTP ports still allow this.
const sendWithApi = async ({ to, subject, html }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      sender: { name: "WellBeing", email: process.env.MAIL_FROM || process.env.MAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    throw new Error(`Mail API responded with ${response.status}: ${await response.text()}`);
  }

  return await response.json();
};

// Plain SMTP, used when no API key is configured (local development)
const sendWithSmtp = async ({ to, subject, html }) => {
  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    connectionTimeout: 10000,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });

  return await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    html
  });
};

async function mailSender(email, userId, emailType) {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    let subject, htmlContent;

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, { verifyToken: token, verifyTokenExpiry: Date.now() + TOKEN_EXPIRY_MS });
      subject = "Verify your email";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification Required</h2>
          <p>Please verify your email address to complete your account setup.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.DOMAIN_NAME}/api/v1/verify/verify-email?token=${token}"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `;
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, { forgotPasswordToken: token, forgotPasswordTokenExpiry: Date.now() + TOKEN_EXPIRY_MS });
      subject = "Reset your password";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password. Click the button below to proceed.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.DOMAIN_NAME}/api/v1/verify/reset-password?token=${token}"
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `;
    } else {
      throw new Error(`Unknown email type: ${emailType}`);
    }

    const mail = { to: email, subject, html: htmlContent };

    return process.env.BREVO_API_KEY ? await sendWithApi(mail) : await sendWithSmtp(mail);
  } catch (error) {
    console.log("Mail could not be sent : ", error.message);
    return null;
  }
};

export default mailSender;
