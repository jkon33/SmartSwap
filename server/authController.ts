import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbStore } from "./dbStore";
import { sendVerificationEmail } from "./emailService";
import { validatePasswordStrength, validateEmailString } from "./security";

const JWT_SECRET = process.env.JWT_SECRET || "smartswap_fallback_super_secret_jwt_key_2026";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Please provide name, email and password." });
      return;
    }

    // Input bounds check on name length
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      res.status(400).json({ success: false, message: "Name must be between 2 and 50 characters." });
      return;
    }

    // RFC Strict Email syntax check
    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmailString(trimmedEmail)) {
      res.status(400).json({ success: false, message: "Invalid email address format entered." });
      return;
    }

    // Sophisticated password strength verification
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      res.status(400).json({ success: false, message: pwdCheck.reason });
      return;
    }

    const existingUser = dbStore.getUserByEmail(trimmedEmail);
    if (existingUser) {
      res.status(400).json({ success: false, message: "A user with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = dbStore.createUser({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      role: "user", // defaults to customer
    });

    // Send the verification mail (non-blocking)
    sendVerificationEmail(
      newUser.email,
      newUser.name,
      newUser.emailVerificationCode || "",
      newUser.emailVerificationToken || ""
    ).catch((err) => {
      console.error("Failed to send verification email asynchronously:", err);
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

    // Exclude password from response
    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: "Registration successful! A verification code has been sent to your email.",
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Internal server error occurred.", error: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Please enter email and password." });
      return;
    }

    const user = dbStore.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const { passwordHash: _, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function getMe(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;

    res.status(200).json({
      success: true,
      data: safeUser,
    });
  } catch (error: any) {
    console.error("GetMe Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile info." });
  }
}

export async function verifyCode(req: Request, res: Response): Promise<void> {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, message: "Please provide both email and 6-digit verification code." });
      return;
    }

    const user = dbStore.getUserByEmail(email);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found with this email." });
      return;
    }

    if (user.isEmailVerified) {
      res.status(200).json({ success: true, message: "Email is already verified." });
      return;
    }

    if (user.emailVerificationCode !== code.trim()) {
      res.status(400).json({ success: false, message: "Invalid verification code. Please try again." });
      return;
    }

    // Verify user
    dbStore.updateUser(user.id, { isEmailVerified: true });

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in or trade.",
      data: { success: true }
    });
  } catch (error: any) {
    console.error("verifyCode Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function verifyEmailLink(req: Request, res: Response): Promise<void> {
  try {
    const email = req.query.email as string;
    const token = req.query.token as string;

    if (!email || !token) {
      res.status(400).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
          <h2 style="color: #ef4444;">Verification Failed</h2>
          <p>Invalid or missing verification parameters.</p>
        </div>
      `);
      return;
    }

    const user = dbStore.getUserByEmail(email);
    if (!user) {
      res.status(404).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
          <h2 style="color: #ef4444;">Verification Failed</h2>
          <p>User not found.</p>
        </div>
      `);
      return;
    }

    if (user.isEmailVerified) {
      res.status(200).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #f8fafc; padding: 40px; border-radius: 8px; max-width: 500px; margin-left: auto; margin-right: auto; border: 1px solid #e2e8f0;">
          <h1 style="color: #10b981; font-size: 40px; margin-bottom: 10px;">&check;</h1>
          <h2 style="color: #0f172a; margin-top: 0;">Already Verified</h2>
          <p style="color: #64748b;">Your email address is already verified. You can return to the app and continue.</p>
        </div>
      `);
      return;
    }

    if (user.emailVerificationToken !== token) {
      res.status(400).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
          <h2 style="color: #ef4444;">Verification Failed</h2>
          <p>Invalid or expired verification link token.</p>
        </div>
      `);
      return;
    }

    // Update state to true
    dbStore.updateUser(user.id, { isEmailVerified: true });

    res.status(200).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px; padding: 40px; max-width: 500px; margin-left: auto; margin-right: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="display: inline-block; background-color: #d1fae5; color: #065f46; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; font-size: 32px; font-weight: bold; margin-bottom: 24px;">&check;</div>
        <h1 style="color: #0f172a; margin-bottom: 8px; font-size: 24px; font-weight: bold;">Email Verified!</h1>
        <p style="color: #475569; font-size: 15px; margin-bottom: 32px; line-height: 1.5;">Your email has been successfully verified. You now have full access to trading rates, cross-chain swaps, and security configurations.</p>
        <p style="font-size: 13px; color: #94a3b8;">You may close this window and sign in inside the app.</p>
      </div>
    `);
  } catch (error: any) {
    console.error("verifyEmailLink Error:", error);
    res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h2 style="color: #ef4444;">Internal Server Error</h2>
        <p>An error occurred while verifying your email.</p>
      </div>
    `);
  }
}

export async function resendCode(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Please provide an email address." });
      return;
    }

    const user = dbStore.getUserByEmail(email);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ success: false, message: "This email address is already verified." });
      return;
    }

    // Generate new code and token
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);

    dbStore.updateUser(user.id, {
      emailVerificationCode: newCode,
      emailVerificationToken: newToken
    });

    // Send email (non-blocking)
    sendVerificationEmail(user.email, user.name, newCode, newToken).catch((err) => {
      console.error("Resend async email failed:", err);
    });

    res.status(200).json({
      success: true,
      message: "A new verification code has been dispatched to your email address.",
      data: { success: true }
    });
  } catch (error: any) {
    console.error("resendCode Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
