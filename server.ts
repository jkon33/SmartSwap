import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import { dbStore } from "./server/dbStore";

// Load environment variables
dotenv.config();

// Controllers
import { register, login, getMe, verifyCode, verifyEmailLink, resendCode } from "./server/authController";
import { addCryptoWallet, addBankAccount, getWithdrawalMethods } from "./server/userController";
import { getQuote, createSwapTransaction, getUserTransactions } from "./server/swapController";
import {
  getAllUsers,
  getAllTransactions,
  updateTransactionStatus,
  addDepositDetail,
  updateDepositDetailStatus,
  syncPrices,
  getAssetsList,
  addAsset,
  updateAssetDetails,
} from "./server/adminController";

// Middlewares
import { authMiddleware, adminMiddleware } from "./server/authMiddleware";
import {
  secureCorsMiddleware,
  sanitizeInputMiddleware,
  rateLimiter,
} from "./server/security";

// Services
import { startPriceService } from "./server/priceService";
import { initSocketManager } from "./server/socketManager";

async function runFullStackServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    console.log("MongoDB connection string specified. Connecting to MongoDB cluster...");
    try {
      await mongoose.connect(mongoUri);
      console.log("Successfully connected to MongoDB Atlas!");
      // Bidirectionally synchronise memory and file states with Cluster collections
      await dbStore.syncWithMongoDB();
    } catch (err) {
      console.error("Warning: Could not connect to MongoDB Atlas.", err);
      console.log("Gracefully falling back to local JSON file storage.");
    }
  } else {
    console.log("No MONGODB_URI environment variable detected. Defaulting to local File storage.");
  }

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const HOST = "0.0.0.0";

  // Body parser size limit safeguard
  app.use(express.json({ limit: "15kb" }));

  // CORS security validation layers
  app.use(secureCorsMiddleware);

  // Deep sanitization of request bodies, queries and params to neutralize injection
  app.use(sanitizeInputMiddleware);

  // Global rate limiter setup (protects API endpoints from general scanner floodings)
  app.use("/api", rateLimiter({ windowMs: 60000, max: 100 }));

  // Sensitive security endpoint rate limiter (protects brute-forceable authentication paths)
  const authLimit = rateLimiter({ windowMs: 60000, max: 8, sensitive: true });

  // --- API ROUTING SECTION ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "SmartSwap fullstack engine operational." });
  });

  // SMTP Test diagnostic endpoint
  app.get("/api/debug/test-smtp", async (req, res) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS ? "********" : "NOT_SET";
    const smtpService = process.env.SMTP_SERVICE;
    
    try {
      const nodemailer = await import("nodemailer");
      console.log("[DEBUG-SMTP] Testing SMTP with configuration:", { smtpHost, smtpPort, smtpUser, smtpPass: "SET", smtpService });
      
      const isGmail = smtpHost === "smtp.gmail.com" || 
                      (smtpUser && smtpUser.endsWith("@gmail.com")) || 
                      (smtpService && smtpService.toLowerCase() === "gmail");

      let transporter;
      if (isGmail && smtpUser && process.env.SMTP_PASS) {
        transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: {
            user: smtpUser,
            pass: process.env.SMTP_PASS,
          },
        });
      } else if (smtpHost && smtpUser && process.env.SMTP_PASS) {
        transporter = nodemailer.default.createTransport({
          host: smtpHost,
          port: smtpPort ? parseInt(smtpPort) : 587,
          secure: smtpPort === "465",
          auth: {
            user: smtpUser,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        throw new Error("No real SMTP configuration detected in .env file.");
      }

      await transporter.verify();
      
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: smtpUser || "oluzeun21@gmail.com",
        subject: "SmartSwap SMTP Connection Test",
        text: "This is a direct test email from your SmartSwap platform to verify SMTP configuration.",
        html: "<h3>SmartSwap SMTP Connection Test</h3><p>This is a direct test email from your SmartSwap platform to verify SMTP configuration.</p>"
      });

      res.json({
        success: true,
        message: "SMTP verified and test email sent successfully!",
        info
      });
    } catch (err: any) {
      console.error("[DEBUG-SMTP] Error during test:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Unknown error",
        stack: err.stack,
        config: { smtpHost, smtpPort, smtpUser, smtpPass, smtpService }
      });
    }
  });

  // Live prices HTTP fallback endpoint
  app.get("/api/prices", (req, res) => {
    res.json({ success: true, data: dbStore.getPrices() });
  });

  // Authentication API (Fortified with strict request rate limiting)
  app.post("/api/auth/register", authLimit, register);
  app.post("/api/auth/login", authLimit, login);
  app.get("/api/auth/me", authMiddleware as any, getMe as any);
  app.post("/api/auth/verify-code", authLimit, verifyCode);
  app.get("/api/auth/verify-email", verifyEmailLink);
  app.post("/api/auth/resend-code", authLimit, resendCode);

  // User Profile & Wallets API
  app.post("/api/user/wallet", authMiddleware as any, addCryptoWallet as any);
  app.post("/api/user/bank", authMiddleware as any, addBankAccount as any);
  app.get("/api/user/withdraw-methods", authMiddleware as any, getWithdrawalMethods as any);

  // Swap Core API
  app.get("/api/swap/quote", getQuote as any);
  app.post("/api/swap/transact", authMiddleware as any, createSwapTransaction as any);
  app.get("/api/swap/history", authMiddleware as any, getUserTransactions as any);

  // Administrative Control API
  app.get("/api/assets", authMiddleware as any, getAssetsList as any);
  app.get("/api/admin/users", adminMiddleware as any, getAllUsers as any);
  app.get("/api/admin/transactions", adminMiddleware as any, getAllTransactions as any);
  app.post("/api/admin/transactions/:id/status", adminMiddleware as any, updateTransactionStatus as any);
  app.post("/api/admin/deposit", adminMiddleware as any, addDepositDetail as any);
  app.post("/api/admin/deposit/:id/status", adminMiddleware as any, updateDepositDetailStatus as any);
  app.post("/api/admin/sync-prices", adminMiddleware as any, syncPrices as any);
  app.post("/api/admin/assets", adminMiddleware as any, addAsset as any);
  app.post("/api/admin/assets/:code", adminMiddleware as any, updateAssetDetails as any);

  // --- END API ROUTING SECTION ---

  // Create standard native HTTP server hosting both Express & WebSockets
  const server = http.createServer(app);

  // Mount Socket.IO
  initSocketManager(server);

  // Initialize background micro-tickers
  startPriceService();

  // Vite visual middleware routing configuration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack dev server in VITE MIDDLEWARE MODE...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Deploying files in static production assets mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`SmartSwap application running live on http://${HOST}:${PORT}`);
  });
}

runFullStackServer().catch((error) => {
  console.error("Critical server startup failure:", error);
});
