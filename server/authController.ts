import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbStore } from "./dbStore";

const JWT_SECRET = process.env.JWT_SECRET || "smartswap_fallback_super_secret_jwt_key_2026";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Please provide name, email and password." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
      return;
    }

    const existingUser = dbStore.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, message: "A user with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = dbStore.createUser({
      name,
      email,
      passwordHash,
      role: "user", // defaults to customer
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

    // Exclude password from response
    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: "Registration successful!",
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
