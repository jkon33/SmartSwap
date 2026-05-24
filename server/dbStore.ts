import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// --- MongoDB/Mongoose Schemas & Models ---
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationToken: { type: String },
  cryptoWallets: [{
    id: String,
    currency: String,
    address: String,
    label: String
  }],
  bankAccounts: [{
    id: String,
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    label: String
  }],
  balances: { type: Map, of: Number },
  createdAt: { type: String, required: true }
}, { strict: false });

const TransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  fromCurrency: { type: String, required: true },
  toCurrency: { type: String, required: true },
  fromAmount: { type: Number, required: true },
  toAmount: { type: Number, required: true },
  rate: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  depositDetails: {
    id: String,
    type: String,
    currency: String,
    addressOrDetails: String,
    isActive: Boolean
  },
  withdrawDetails: mongoose.Schema.Types.Mixed,
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
}, { strict: false });

const DepositDetailSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  currency: { type: String, required: true },
  addressOrDetails: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { strict: false });

const PriceSchema = new mongoose.Schema({
  currencyPair: { type: String, required: true, unique: true },
  rate: { type: Number, required: true },
  lastUpdated: { type: String, required: true }
}, { strict: false });

const AssetSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["crypto", "fiat"], required: true },
  isActive: { type: Boolean, default: true },
  rateToUSD: { type: Number, required: true },
  iconBg: { type: String }
}, { strict: false });

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const TransactionModel = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
export const DepositDetailModel = mongoose.models.DepositDetail || mongoose.model("DepositDetail", DepositDetailSchema);
export const PriceModel = mongoose.models.Price || mongoose.model("Price", PriceSchema);
export const AssetModel = mongoose.models.Asset || mongoose.model("Asset", AssetSchema);

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

export interface CryptoWallet {
  id: string;
  currency: string;
  address: string;
  label: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  isEmailVerified?: boolean;
  emailVerificationCode?: string;
  emailVerificationToken?: string;
  cryptoWallets: CryptoWallet[];
  bankAccounts: BankAccount[];
  balances: Record<string, number>;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: "pending" | "completed" | "failed";
  depositDetails: DepositDetail;
  withdrawDetails: any; // user wallet address or bank details
  createdAt: string;
  updatedAt: string;
}

export interface DepositDetail {
  id: string;
  type: "crypto" | "bank";
  currency: string; // BTC, ETH, USDT, SOL, USD, EUR, GBP
  addressOrDetails: string; // wallet address or bank account info (IBAN, bank name, etc)
  isActive: boolean;
}

export interface Price {
  currencyPair: string; // e.g., "BTC/USD"
  rate: number;
  lastUpdated: string;
}

export interface Asset {
  code: string;
  name: string;
  type: "crypto" | "fiat";
  isActive: boolean;
  rateToUSD: number;
  iconBg?: string;
}

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  depositDetails: DepositDetail[];
  prices: Price[];
  assets: Asset[];
}

class DbStore {
  private data: DatabaseSchema = {
    users: [],
    transactions: [],
    depositDetails: [],
    prices: [],
    assets: [],
  };

  constructor() {
    this.initDb();
  }

  private initDb() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
      }

      // Self-heal/seed assets array if missing or empty
      if (!this.data.assets || this.data.assets.length === 0) {
        this.data.assets = [
          { code: "BTC", name: "Bitcoin", type: "crypto", isActive: true, rateToUSD: 68450.00, iconBg: "bg-amber-100 text-amber-600 border-amber-200" },
          { code: "ETH", name: "Ethereum", type: "crypto", isActive: true, rateToUSD: 3450.00, iconBg: "bg-indigo-100 text-indigo-600 border-indigo-200" },
          { code: "SOL", name: "Solana", type: "crypto", isActive: true, rateToUSD: 168.50, iconBg: "bg-purple-100 text-purple-600 border-purple-200" },
          { code: "USDT", name: "Tether USD", type: "crypto", isActive: true, rateToUSD: 1.00, iconBg: "bg-teal-100 text-teal-600 border-teal-200" },
          { code: "USD", name: "US Dollar", type: "fiat", isActive: true, rateToUSD: 1.00, iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200" },
          { code: "EUR", name: "Euro Coin", type: "fiat", isActive: true, rateToUSD: 1.087, iconBg: "bg-blue-100 text-blue-600 border-blue-200" },
          { code: "GBP", name: "British Pound", type: "fiat", isActive: true, rateToUSD: 1.266, iconBg: "bg-rose-100 text-rose-600 border-rose-200" }
        ];
        this.saveToDisk();
      }

      this.ensureDefaultUsers();
    } catch (err) {
      console.error("Error initializing Database File:", err);
      // Fallback to in-memory in worst case
      this.seedInitialData();
      this.ensureDefaultUsers();
    }
  }

  private ensureDefaultUsers() {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync("adminpassword", salt);
    const userPasswordHash = bcrypt.hashSync("userpassword", salt);

    const defaultUsers: User[] = [
      {
        id: "usr_admin_1",
        name: "SmartSwap Admin",
        email: "admin@smartswap.com",
        passwordHash: adminPasswordHash,
        role: "admin",
        cryptoWallets: [],
        bankAccounts: [],
        balances: {
          BTC: 10.0,
          ETH: 100.0,
          USDT: 500000.0,
          SOL: 1000.0,
          USD: 1000000.0,
          EUR: 1000000.0,
          GBP: 1000000.0,
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "usr_admin_io",
        name: "SmartSwap Admin (IO)",
        email: "admin@smartswap.io",
        passwordHash: adminPasswordHash,
        role: "admin",
        cryptoWallets: [],
        bankAccounts: [],
        balances: {
          BTC: 10.0,
          ETH: 100.0,
          USDT: 500000.0,
          SOL: 1000.0,
          USD: 1000000.0,
          EUR: 1000000.0,
          GBP: 1000000.0,
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "usr_demo_2",
        name: "Demo Investor",
        email: "user@smartswap.com",
        passwordHash: userPasswordHash,
        role: "user",
        cryptoWallets: [
          {
            id: "wlt_1",
            currency: "BTC",
            address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            label: "My Trust Wallet",
          },
          {
            id: "wlt_2",
            currency: "USDT",
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            label: "Metamask Ledger",
          }
        ],
        bankAccounts: [
          {
            id: "bnk_1",
            bankName: "Chase Bank",
            accountNumber: "1234567890",
            routingNumber: "021000021",
            label: "Primary Savings",
          }
        ],
        balances: {
          BTC: 0.15,
          ETH: 2.50,
          USDT: 2500.0,
          SOL: 20.0,
          USD: 10000.0,
          EUR: 5000.0,
          GBP: 3000.0,
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "usr_demo_io",
        name: "Default User (IO)",
        email: "user@smartswap.io",
        passwordHash: userPasswordHash,
        role: "user",
        cryptoWallets: [],
        bankAccounts: [],
        balances: {
          BTC: 0.15,
          ETH: 2.50,
          USDT: 2500.0,
          SOL: 20.0,
          USD: 10000.0,
          EUR: 5000.0,
          GBP: 3000.0,
        },
        createdAt: new Date().toISOString()
      }
    ];

    if (!this.data.users) {
      this.data.users = [];
    }

    for (const defU of defaultUsers) {
      const existingIdx = this.data.users.findIndex(u => u && u.email && u.email.toLowerCase() === defU.email.toLowerCase());
      if (existingIdx === -1) {
        defU.isEmailVerified = true;
        this.data.users.push(defU);
      } else {
        const u = this.data.users[existingIdx];
        if (u) {
          u.isEmailVerified = true;
          if (!u.id) u.id = defU.id;
          if (!u.passwordHash) u.passwordHash = defU.passwordHash;
          if (!u.balances || Object.keys(u.balances).length === 0) u.balances = defU.balances;
          if (!u.cryptoWallets || u.cryptoWallets.length === 0) u.cryptoWallets = defU.cryptoWallets;
          if (!u.bankAccounts || u.bankAccounts.length === 0) u.bankAccounts = defU.bankAccounts;
        }
      }
    }

    this.saveToDisk();
  }

  private seedInitialData() {
    console.log("Seeding initial database data...");
    
    // Seed Users (1 Admin, 1 User)
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync("adminpassword", salt);
    const userPasswordHash = bcrypt.hashSync("userpassword", salt);

    const initialUsers: User[] = [
      {
        id: "usr_admin_1",
        name: "SmartSwap Admin",
        email: "admin@smartswap.com",
        passwordHash: adminPasswordHash,
        role: "admin",
        cryptoWallets: [],
        bankAccounts: [],
        balances: {
          BTC: 10.0,
          ETH: 100.0,
          USDT: 500000.0,
          SOL: 1000.0,
          USD: 1000000.0,
          EUR: 1000000.0,
          GBP: 1000000.0,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr_demo_2",
        name: "Demo Investor",
        email: "user@smartswap.com",
        passwordHash: userPasswordHash,
        role: "user",
        cryptoWallets: [
          {
            id: "wlt_1",
            currency: "BTC",
            address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            label: "My Trust Wallet",
          },
          {
            id: "wlt_2",
            currency: "USDT",
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            label: "Metamask Ledger",
          }
        ],
        bankAccounts: [
          {
            id: "bnk_1",
            bankName: "Chase Bank",
            accountNumber: "1234567890",
            routingNumber: "021000021",
            label: "Primary Savings",
          }
        ],
        balances: {
          BTC: 0.15,
          ETH: 2.50,
          USDT: 2500.0,
          SOL: 20.0,
          USD: 10000.0,
          EUR: 5000.0,
          GBP: 3000.0,
        },
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed Deposit Details (Admin details where users deposit resources)
    const initialDepositDetails: DepositDetail[] = [
      {
        id: "dep_btc",
        type: "crypto",
        currency: "BTC",
        addressOrDetails: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
        isActive: true,
      },
      {
        id: "dep_eth",
        type: "crypto",
        currency: "ETH",
        addressOrDetails: "0x98311a63cE9f291E33E1c27cEc47d8481A6b106D",
        isActive: true,
      },
      {
        id: "dep_usdt",
        type: "crypto",
        currency: "USDT",
        addressOrDetails: "0x98311a63cE9f291E33E1c27cEc47d8481A6b106D",
        isActive: true,
      },
      {
        id: "dep_sol",
        type: "crypto",
        currency: "SOL",
        addressOrDetails: "HN7cABFi4Y4GfNQQWfXcr377bQG6Xz6N3uY",
        isActive: true,
      },
      {
        id: "dep_usd",
        type: "bank",
        currency: "USD",
        addressOrDetails: "SmartSwap Corp, Bank of America, Acc: 9876543210, Routing: 021000021",
        isActive: true,
      },
      {
        id: "dep_eur",
        type: "bank",
        currency: "EUR",
        addressOrDetails: "SmartSwap GmbH, Deutsche Bank, IBAN: DE89370400440532013000, BIC: DEUTDEDDXXX",
        isActive: true,
      },
      {
        id: "dep_gbp",
        type: "bank",
        currency: "GBP",
        addressOrDetails: "SmartSwap Ltd, Barclays Bank, Sort Code: 20-00-00, Acc: 11223344",
        isActive: true,
      },
    ];

    // Seed Initial Price Points
    const initialPrices: Price[] = [
      { currencyPair: "BTC/USD", rate: 68450.00, lastUpdated: new Date().toISOString() },
      { currencyPair: "ETH/USD", rate: 3450.00, lastUpdated: new Date().toISOString() },
      { currencyPair: "SOL/USD", rate: 168.50, lastUpdated: new Date().toISOString() },
      { currencyPair: "USDT/USD", rate: 1.00, lastUpdated: new Date().toISOString() },
      { currencyPair: "USD/EUR", rate: 0.92, lastUpdated: new Date().toISOString() },
      { currencyPair: "USD/GBP", rate: 0.79, lastUpdated: new Date().toISOString() },
    ];

    const initialAssets: Asset[] = [
      { code: "BTC", name: "Bitcoin", type: "crypto", isActive: true, rateToUSD: 68450.00, iconBg: "bg-amber-100 text-amber-600 border-amber-200" },
      { code: "ETH", name: "Ethereum", type: "crypto", isActive: true, rateToUSD: 3450.00, iconBg: "bg-indigo-100 text-indigo-600 border-indigo-200" },
      { code: "SOL", name: "Solana", type: "crypto", isActive: true, rateToUSD: 168.50, iconBg: "bg-purple-100 text-purple-600 border-purple-200" },
      { code: "USDT", name: "Tether USD", type: "crypto", isActive: true, rateToUSD: 1.00, iconBg: "bg-teal-100 text-teal-600 border-teal-200" },
      { code: "USD", name: "US Dollar", type: "fiat", isActive: true, rateToUSD: 1.00, iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200" },
      { code: "EUR", name: "Euro Coin", type: "fiat", isActive: true, rateToUSD: 1.087, iconBg: "bg-blue-100 text-blue-600 border-blue-200" },
      { code: "GBP", name: "British Pound", type: "fiat", isActive: true, rateToUSD: 1.266, iconBg: "bg-rose-100 text-rose-600 border-rose-200" }
    ];

    this.data = {
      users: initialUsers,
      transactions: [],
      depositDetails: initialDepositDetails,
      prices: initialPrices,
      assets: initialAssets,
    };

    this.saveToDisk();
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing to Database File:", err);
    }
  }

  // Synchronise Memory and Local Database Store with MongoDB Atlas Collections
  async syncWithMongoDB() {
    if (mongoose.connection.readyState !== 1) {
      console.log("Mongoose is not connected. Skipping MongoDB sync.");
      return;
    }

    try {
      console.log("Synchronising data memory/local file with MongoDB Atlas...");

      // 1. Sync Users
      const mongoUsers = await (UserModel as any).find({}).lean();
      if (mongoUsers && mongoUsers.length > 0) {
        console.log(`Loaded ${mongoUsers.length} users from MongoDB.`);
        this.data.users = mongoUsers.map((u: any) => {
          const balancesRecord: Record<string, number> = {};
          if (u.balances) {
            const b = u.balances instanceof Map ? Object.fromEntries(u.balances) : u.balances;
            for (const k of Object.keys(b)) {
              balancesRecord[k] = Number(b[k]);
            }
          }
          return {
            id: u.id || "usr_" + Math.random().toString(36).substr(2, 9),
            name: u.name,
            email: u.email,
            passwordHash: u.passwordHash,
            role: u.role || "user",
            cryptoWallets: (u.cryptoWallets || []).map((w: any) => ({
              id: w.id,
              currency: w.currency,
              address: w.address,
              label: w.label,
            })),
            bankAccounts: (u.bankAccounts || []).map((b: any) => ({
              id: b.id,
              bankName: b.bankName,
              accountNumber: b.accountNumber,
              routingNumber: b.routingNumber,
              label: b.label,
            })),
            balances: balancesRecord,
            createdAt: u.createdAt || new Date().toISOString(),
          };
        });
      }

      // Always run ensureDefaultUsers to self-heal missing hashes and add standard users if missing
      this.ensureDefaultUsers();

      // Write-through all users to MongoDB ensuring they exist & have password hashes
      for (const u of this.data.users) {
        await UserModel.updateOne({ email: u.email.toLowerCase() }, { $set: u }, { upsert: true });
      }

      // 2. Sync DepositDetails
      const mongoDepositDetails = await (DepositDetailModel as any).find({}).lean();
      if (mongoDepositDetails && mongoDepositDetails.length > 0) {
        console.log(`Loaded ${mongoDepositDetails.length} deposit details from MongoDB.`);
        this.data.depositDetails = mongoDepositDetails.map((d: any) => ({
          id: d.id,
          type: d.type,
          currency: d.currency,
          addressOrDetails: d.addressOrDetails,
          isActive: d.isActive,
        }));
      } else {
        console.log("MongoDB has no deposit details. Seeding deposit details to MongoDB...");
        for (const d of this.data.depositDetails) {
          await DepositDetailModel.create(d);
        }
      }

      // 3. Sync Prices
      const mongoPrices = await (PriceModel as any).find({}).lean();
      if (mongoPrices && mongoPrices.length > 0) {
        console.log(`Loaded ${mongoPrices.length} live prices from MongoDB.`);
        this.data.prices = mongoPrices.map((p: any) => ({
          currencyPair: p.currencyPair,
          rate: Number(p.rate),
          lastUpdated: p.lastUpdated,
        }));
      } else {
        console.log("MongoDB has no prices. Seeding active prices to MongoDB...");
        for (const p of this.data.prices) {
          await PriceModel.create(p);
        }
      }

      // 4. Sync Transactions
      const mongoTransactions = await (TransactionModel as any).find({}).lean();
      if (mongoTransactions && mongoTransactions.length > 0) {
        console.log(`Loaded ${mongoTransactions.length} transactions from MongoDB.`);
        this.data.transactions = mongoTransactions.map((tx: any) => ({
          id: tx.id,
          userId: tx.userId,
          userEmail: tx.userEmail,
          fromCurrency: tx.fromCurrency,
          toCurrency: tx.toCurrency,
          fromAmount: Number(tx.fromAmount),
          toAmount: Number(tx.toAmount),
          rate: Number(tx.rate),
          status: tx.status,
          depositDetails: tx.depositDetails,
          withdrawDetails: tx.withdrawDetails,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        }));
      } else {
        console.log("MongoDB has no transactions. Seeding local transactions to MongoDB...");
        for (const tx of this.data.transactions) {
          await TransactionModel.create(tx);
        }
      }

      // 5. Sync Assets
      const mongoAssets = await (AssetModel as any).find({}).lean();
      if (mongoAssets && mongoAssets.length > 0) {
        console.log(`Loaded ${mongoAssets.length} assets from MongoDB.`);
        this.data.assets = mongoAssets.map((a: any) => ({
          code: a.code,
          name: a.name,
          type: a.type,
          isActive: a.isActive !== false,
          rateToUSD: Number(a.rateToUSD),
          iconBg: a.iconBg,
        }));
      } else {
        console.log("MongoDB has no assets. Seeding active assets to MongoDB...");
        for (const a of this.data.assets) {
          await AssetModel.create(a);
        }
      }


      this.saveToDisk();
      console.log("Local Database Store fully aligned and synchronised with MongoDB Atlas!");
    } catch (err) {
      console.error("Error during MongoDB sync process:", err);
    }
  }

  // --- Users CRUD ---
  getUsers(): User[] {
    const assets = this.getAssets();
    this.data.users.forEach((u) => {
      if (u && u.balances) {
        assets.forEach((a) => {
          if (u.balances[a.code] === undefined) {
            u.balances[a.code] = 0;
          }
        });
      }
    });
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (user && user.balances) {
      const assets = this.getAssets();
      assets.forEach((a) => {
        if (user.balances[a.code] === undefined) {
          user.balances[a.code] = 0;
        }
      });
    }
    return user;
  }

  getUserByEmail(email: string): User | undefined {
    const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.balances) {
      const assets = this.getAssets();
      assets.forEach((a) => {
        if (user.balances[a.code] === undefined) {
          user.balances[a.code] = 0;
        }
      });
    }
    return user;
  }

  createUser(user: Omit<User, "id" | "createdAt" | "balances" | "cryptoWallets" | "bankAccounts">): User {
    const initialBalances: Record<string, number> = {};
    this.getAssets().forEach((a) => {
      initialBalances[a.code] = 0;
    });

    const newUser: User = {
      ...user,
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      isEmailVerified: false,
      emailVerificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      emailVerificationToken: Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11),
      cryptoWallets: [],
      bankAccounts: [],
      balances: initialBalances,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      UserModel.create(newUser).catch((err) => console.error("Error writing user to Mongo:", err));
    }

    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return undefined;

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates,
    };
    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      UserModel.updateOne({ id }, { $set: updates }).catch((err) =>
        console.error("Error writing user update to Mongo:", err)
      );
    }

    return this.data.users[userIndex];
  }

  // --- Deposit Details CRUD ---
  getDepositDetails(): DepositDetail[] {
    return this.data.depositDetails;
  }

  getDepositDetailById(id: string): DepositDetail | undefined {
    return this.data.depositDetails.find((d) => d.id === id);
  }

  createDepositDetail(detail: Omit<DepositDetail, "id">): DepositDetail {
    const newDetail: DepositDetail = {
      ...detail,
      id: "dep_" + Math.random().toString(36).substr(2, 9),
    };
    this.data.depositDetails.push(newDetail);
    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      DepositDetailModel.create(newDetail).catch((err) =>
        console.error("Error creating deposit detail in Mongo:", err)
      );
    }

    return newDetail;
  }

  updateDepositDetail(id: string, updates: Partial<DepositDetail>): DepositDetail | undefined {
    const index = this.data.depositDetails.findIndex((d) => d.id === id);
    if (index === -1) return undefined;
    this.data.depositDetails[index] = {
      ...this.data.depositDetails[index],
      ...updates,
    };
    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      DepositDetailModel.updateOne({ id }, { $set: updates }).catch((err) =>
        console.error("Error modifying deposit detail in Mongo:", err)
      );
    }

    return this.data.depositDetails[index];
  }

  // --- Transactions CRUD ---
  getTransactions(): Transaction[] {
    return [...this.data.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTransactionsByUserId(userId: string): Transaction[] {
    return this.data.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find((t) => t.id === id);
  }

  createTransaction(tx: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: "tx_" + Math.random().toString(36).substr(2, 12).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.transactions.push(newTx);
    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      TransactionModel.create(newTx).catch((err) =>
        console.error("Error writing transaction record to Mongo:", err)
      );
    }

    return newTx;
  }

  updateTransactionStatus(id: string, status: "pending" | "completed" | "failed"): Transaction | undefined {
    const index = this.data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const tx = this.data.transactions[index];
    tx.status = status;
    tx.updatedAt = new Date().toISOString();

    if (status === "completed") {
      const user = this.getUserById(tx.userId);
      if (user) {
        const currentFromBal = user.balances[tx.fromCurrency] || 0;
        const currentToBal = user.balances[tx.toCurrency] || 0;

        user.balances[tx.fromCurrency] = Math.max(0, currentFromBal - tx.fromAmount);
        user.balances[tx.toCurrency] = currentToBal + tx.toAmount;
        
        this.updateUser(user.id, { balances: user.balances });
      }
    }

    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      TransactionModel.updateOne({ id }, { $set: { status, updatedAt: tx.updatedAt } }).catch((err) =>
        console.error("Error writing transaction status update to Mongo:", err)
      );
    }

    return tx;
  }

  // --- Prices CRUD ---
  getPrices(): Price[] {
    return this.data.prices;
  }

  updatePrice(currencyPair: string, rate: number): void {
    const index = this.data.prices.findIndex((p) => p.currencyPair === currencyPair);
    const updatedTime = new Date().toISOString();

    if (index !== -1) {
      this.data.prices[index].rate = rate;
      this.data.prices[index].lastUpdated = updatedTime;
    } else {
      this.data.prices.push({
        currencyPair,
        rate,
        lastUpdated: updatedTime,
      });
    }
    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      PriceModel.updateOne(
        { currencyPair },
        { $set: { rate, lastUpdated: updatedTime } },
        { upsert: true }
      ).catch((err) => console.error("Error syncing live spot rates to Mongo:", err));
    }
  }

  // --- Assets CRUD ---
  getAssets(): Asset[] {
    if (!this.data.assets) {
      this.data.assets = [];
    }
    return this.data.assets;
  }

  createAsset(asset: Omit<Asset, "isActive"> & { isActive?: boolean }): Asset {
    if (!this.data.assets) {
      this.data.assets = [];
    }
    const newAsset: Asset = {
      ...asset,
      isActive: asset.isActive !== false,
      iconBg: asset.iconBg || "bg-slate-100 text-slate-600 border-slate-200"
    };
    this.data.assets.push(newAsset);
    
    // Auto-create/update price point for code/USD so conversions work immediately!
    this.updatePrice(`${newAsset.code}/USD`, newAsset.rateToUSD);

    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      AssetModel.create(newAsset).catch((err) =>
        console.error("Error creating asset in Mongo:", err)
      );
    }

    return newAsset;
  }

  updateAsset(code: string, updates: Partial<Asset>): Asset | undefined {
    if (!this.data.assets) return undefined;
    const index = this.data.assets.findIndex((a) => a.code.toUpperCase() === code.toUpperCase());
    if (index === -1) return undefined;

    this.data.assets[index] = {
      ...this.data.assets[index],
      ...updates,
    };

    if (updates.rateToUSD !== undefined) {
      this.updatePrice(`${code.toUpperCase()}/USD`, updates.rateToUSD);
    }

    this.saveToDisk();

    // Mongo write-through
    if (mongoose.connection.readyState === 1) {
      AssetModel.updateOne({ code: code.toUpperCase() }, { $set: updates }).catch((err) =>
        console.error("Error updating asset in Mongo:", err)
      );
    }

    return this.data.assets[index];
  }

}

export const dbStore = new DbStore();
