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
import { register, login, getMe } from "./server/authController";
import { addCryptoWallet, addBankAccount, getWithdrawalMethods } from "./server/userController";
import { getQuote, createSwapTransaction, getUserTransactions } from "./server/swapController";
import {
  getAllUsers,
  getAllTransactions,
  updateTransactionStatus,
  addDepositDetail,
  updateDepositDetailStatus,
  syncPrices,
} from "./server/adminController";

// Middlewares
import { authMiddleware, adminMiddleware } from "./server/authMiddleware";

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

  // Body parser limit (safeguard)
  app.use(express.json());

  // CORS headers (broadly permissive in container context)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // --- API ROUTING SECTION ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "SmartSwap fullstack engine operational." });
  });

  // Authentication API
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", authMiddleware as any, getMe as any);

  // User Profile & Wallets API
  app.post("/api/user/wallet", authMiddleware as any, addCryptoWallet as any);
  app.post("/api/user/bank", authMiddleware as any, addBankAccount as any);
  app.get("/api/user/withdraw-methods", authMiddleware as any, getWithdrawalMethods as any);

  // Swap Core API
  app.get("/api/swap/quote", getQuote as any);
  app.post("/api/swap/transact", authMiddleware as any, createSwapTransaction as any);
  app.get("/api/swap/history", authMiddleware as any, getUserTransactions as any);

  // Administrative Control API
  app.get("/api/admin/users", adminMiddleware as any, getAllUsers as any);
  app.get("/api/admin/transactions", adminMiddleware as any, getAllTransactions as any);
  app.post("/api/admin/transactions/:id/status", adminMiddleware as any, updateTransactionStatus as any);
  app.post("/api/admin/deposit", adminMiddleware as any, addDepositDetail as any);
  app.post("/api/admin/deposit/:id/status", adminMiddleware as any, updateDepositDetailStatus as any);
  app.post("/api/admin/sync-prices", adminMiddleware as any, syncPrices as any);

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
