import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, name: string, code: string, token: string): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"SmartSwap" <no-reply@smartswap.com>`;

  const appUrl = (process.env.APP_URL || "https://ais-pre-p632kafgq6545hshnzdulb-371764684561.europe-west2.run.app").replace(/\/$/, "");
  const verificationLink = `${appUrl}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;

  const emailSubject = "Verify Your SmartSwap Account";
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.025em;">SmartSwap</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Premium Cross-Chain Exchange</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5; color: #334155;">Hello <strong>${name}</strong>,</p>
      
      <p style="font-size: 15px; line-height: 1.5; color: #334155;">
        Thank you for choosing SmartSwap! To start exchanging with zero-slippage quotes and managing your cross-chain assets, please verify your email address.
      </p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 500; text-transform: uppercase;">Your 6-Digit Verification Code</p>
        <div style="font-size: 32px; font-weight: bold; color: #0f172a; letter-spacing: 0.15em; font-family: monospace;">${code}</div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${verificationLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 15px; display: inline-block;">Verify Email Address</a>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
        Or copy and paste this link into your browser:<br />
        <a href="${verificationLink}" style="color: #2563eb; word-break: break-all;">${verificationLink}</a>
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; text-align: center; margin: 0;">
        If you did not sign up for a SmartSwap account, please disregard this email.<br />
        &copy; 2026 SmartSwap Corp. All rights reserved.
      </p>
    </div>
  `;

  // Try real SMTP first
  const isGmail = smtpHost === "smtp.gmail.com" || 
                  (smtpUser && smtpUser.endsWith("@gmail.com")) || 
                  (process.env.SMTP_SERVICE && process.env.SMTP_SERVICE.toLowerCase() === "gmail");

  if (isGmail && smtpUser && smtpPass) {
    try {
      console.log(`[SMTP] Initializing dedicated Gmail SMTP service configuration for ${smtpUser}...`);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass, // User's Gmail App Password (highly recommended)
        },
      });

      await transporter.sendMail({
        from: smtpFrom || smtpUser,
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[SMTP-GMAIL] Verification email sent successfully to: ${email}`);
      return true;
    } catch (err) {
      console.error("[SMTP-GMAIL] Error sending email via Gmail transport:", err);
    }
  } else if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[SMTP] Verification email sent successfully to: ${email}`);
      return true;
    } catch (err) {
      console.error("[SMTP] Error sending email via SMTP transport:", err);
    }
  }

  // Fallback / Development Logs
  console.log(`\n==================================================================`);
  console.log(`[EMAIL COMPILATION SANDBOX / DEV FALLBACK]`);
  console.log(`To enable real email routing, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env`);
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: ${emailSubject}`);
  console.log(`CODE: ${code}`);
  console.log(`LINK: ${verificationLink}`);
  console.log(`==================================================================\n`);

  return false;
}
