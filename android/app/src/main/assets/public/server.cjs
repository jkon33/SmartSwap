var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_mongoose2 = __toESM(require("mongoose"), 1);

// server/dbStore.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_mongoose = __toESM(require("mongoose"), 1);
var UserSchema = new import_mongoose.default.Schema({
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
var TransactionSchema = new import_mongoose.default.Schema({
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
  withdrawDetails: import_mongoose.default.Schema.Types.Mixed,
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
}, { strict: false });
var DepositDetailSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  currency: { type: String, required: true },
  addressOrDetails: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { strict: false });
var PriceSchema = new import_mongoose.default.Schema({
  currencyPair: { type: String, required: true, unique: true },
  rate: { type: Number, required: true },
  lastUpdated: { type: String, required: true }
}, { strict: false });
var AssetSchema = new import_mongoose.default.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["crypto", "fiat"], required: true },
  isActive: { type: Boolean, default: true },
  rateToUSD: { type: Number, required: true },
  iconBg: { type: String }
}, { strict: false });
var UserModel = import_mongoose.default.models.User || import_mongoose.default.model("User", UserSchema);
var TransactionModel = import_mongoose.default.models.Transaction || import_mongoose.default.model("Transaction", TransactionSchema);
var DepositDetailModel = import_mongoose.default.models.DepositDetail || import_mongoose.default.model("DepositDetail", DepositDetailSchema);
var PriceModel = import_mongoose.default.models.Price || import_mongoose.default.model("Price", PriceSchema);
var AssetModel = import_mongoose.default.models.Asset || import_mongoose.default.model("Asset", AssetSchema);
var DB_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DB_DIR, "db.json");
var DbStore = class {
  constructor() {
    this.data = {
      users: [],
      transactions: [],
      depositDetails: [],
      prices: [],
      assets: []
    };
    this.initDb();
  }
  initDb() {
    try {
      if (!import_fs.default.existsSync(DB_DIR)) {
        import_fs.default.mkdirSync(DB_DIR, { recursive: true });
      }
      if (import_fs.default.existsSync(DB_FILE)) {
        const fileContent = import_fs.default.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
      }
      if (!this.data.assets || this.data.assets.length === 0) {
        this.data.assets = [
          { code: "BTC", name: "Bitcoin", type: "crypto", isActive: true, rateToUSD: 68450, iconBg: "bg-amber-100 text-amber-600 border-amber-200" },
          { code: "ETH", name: "Ethereum", type: "crypto", isActive: true, rateToUSD: 3450, iconBg: "bg-indigo-100 text-indigo-600 border-indigo-200" },
          { code: "SOL", name: "Solana", type: "crypto", isActive: true, rateToUSD: 168.5, iconBg: "bg-purple-100 text-purple-600 border-purple-200" },
          { code: "USDT", name: "Tether USD", type: "crypto", isActive: true, rateToUSD: 1, iconBg: "bg-teal-100 text-teal-600 border-teal-200" },
          { code: "USD", name: "US Dollar", type: "fiat", isActive: true, rateToUSD: 1, iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200" },
          { code: "EUR", name: "Euro Coin", type: "fiat", isActive: true, rateToUSD: 1.087, iconBg: "bg-blue-100 text-blue-600 border-blue-200" },
          { code: "GBP", name: "British Pound", type: "fiat", isActive: true, rateToUSD: 1.266, iconBg: "bg-rose-100 text-rose-600 border-rose-200" }
        ];
        this.saveToDisk();
      }
      this.ensureDefaultUsers();
    } catch (err) {
      console.error("Error initializing Database File:", err);
      this.seedInitialData();
      this.ensureDefaultUsers();
    }
  }
  ensureDefaultUsers() {
    const salt = import_bcryptjs.default.genSaltSync(10);
    const adminPasswordHash = import_bcryptjs.default.hashSync("adminpassword", salt);
    const userPasswordHash = import_bcryptjs.default.hashSync("userpassword", salt);
    const defaultUsers = [
      {
        id: "usr_admin_1",
        name: "SmartSwap Admin",
        email: "oluzeun21@gmail.com",
        passwordHash: adminPasswordHash,
        role: "admin",
        cryptoWallets: [],
        bankAccounts: [],
        balances: {
          BTC: 10,
          ETH: 100,
          USDT: 5e5,
          SOL: 1e3,
          USD: 1e6,
          EUR: 1e6,
          GBP: 1e6
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
          BTC: 10,
          ETH: 100,
          USDT: 5e5,
          SOL: 1e3,
          USD: 1e6,
          EUR: 1e6,
          GBP: 1e6
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
            label: "My Trust Wallet"
          },
          {
            id: "wlt_2",
            currency: "USDT",
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            label: "Metamask Ledger"
          }
        ],
        bankAccounts: [
          {
            id: "bnk_1",
            bankName: "Chase Bank",
            accountNumber: "1234567890",
            routingNumber: "021000021",
            label: "Primary Savings"
          }
        ],
        balances: {
          BTC: 0.15,
          ETH: 2.5,
          USDT: 2500,
          SOL: 20,
          USD: 1e4,
          EUR: 5e3,
          GBP: 3e3
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
          ETH: 2.5,
          USDT: 2500,
          SOL: 20,
          USD: 1e4,
          EUR: 5e3,
          GBP: 3e3
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    if (!this.data.users) {
      this.data.users = [];
    }
    for (const defU of defaultUsers) {
      const existingIdx = this.data.users.findIndex((u) => u && u.email && u.email.toLowerCase() === defU.email.toLowerCase());
      if (existingIdx === -1) {
        defU.isEmailVerified = true;
        this.data.users.push(defU);
      } else {
        const u = this.data.users[existingIdx];
        if (u) {
          u.isEmailVerified = true;
          if (!u.id) u.id = defU.id;
          if (defU.role === "admin") {
            u.role = "admin";
            u.passwordHash = defU.passwordHash;
          } else {
            if (!u.passwordHash) u.passwordHash = defU.passwordHash;
          }
          if (!u.balances || Object.keys(u.balances).length === 0) u.balances = defU.balances;
          if (!u.cryptoWallets || u.cryptoWallets.length === 0) u.cryptoWallets = defU.cryptoWallets;
          if (!u.bankAccounts || u.bankAccounts.length === 0) u.bankAccounts = defU.bankAccounts;
        }
      }
    }
    this.saveToDisk();
  }
  seedInitialData() {
    console.log("Seeding initial database data...");
    const salt = import_bcryptjs.default.genSaltSync(10);
    const adminPasswordHash = import_bcryptjs.default.hashSync("adminpassword", salt);
    const userPasswordHash = import_bcryptjs.default.hashSync("userpassword", salt);
    const initialUsers = [
      {
        id: "usr_admin_1",
        name: "SmartSwap Admin",
        email: "oluzeun21@gmail.com",
        passwordHash: adminPasswordHash,
        role: "admin",
        cryptoWallets: [],
        bankAccounts: [],
        balances: {
          BTC: 10,
          ETH: 100,
          USDT: 5e5,
          SOL: 1e3,
          USD: 1e6,
          EUR: 1e6,
          GBP: 1e6
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
            label: "My Trust Wallet"
          },
          {
            id: "wlt_2",
            currency: "USDT",
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            label: "Metamask Ledger"
          }
        ],
        bankAccounts: [
          {
            id: "bnk_1",
            bankName: "Chase Bank",
            accountNumber: "1234567890",
            routingNumber: "021000021",
            label: "Primary Savings"
          }
        ],
        balances: {
          BTC: 0.15,
          ETH: 2.5,
          USDT: 2500,
          SOL: 20,
          USD: 1e4,
          EUR: 5e3,
          GBP: 3e3
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    const initialDepositDetails = [
      {
        id: "dep_btc",
        type: "crypto",
        currency: "BTC",
        addressOrDetails: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
        isActive: true
      },
      {
        id: "dep_eth",
        type: "crypto",
        currency: "ETH",
        addressOrDetails: "0x98311a63cE9f291E33E1c27cEc47d8481A6b106D",
        isActive: true
      },
      {
        id: "dep_usdt",
        type: "crypto",
        currency: "USDT",
        addressOrDetails: "0x98311a63cE9f291E33E1c27cEc47d8481A6b106D",
        isActive: true
      },
      {
        id: "dep_sol",
        type: "crypto",
        currency: "SOL",
        addressOrDetails: "HN7cABFi4Y4GfNQQWfXcr377bQG6Xz6N3uY",
        isActive: true
      },
      {
        id: "dep_usd",
        type: "bank",
        currency: "USD",
        addressOrDetails: "SmartSwap Corp, Bank of America, Acc: 9876543210, Routing: 021000021",
        isActive: true
      },
      {
        id: "dep_eur",
        type: "bank",
        currency: "EUR",
        addressOrDetails: "SmartSwap GmbH, Deutsche Bank, IBAN: DE89370400440532013000, BIC: DEUTDEDDXXX",
        isActive: true
      },
      {
        id: "dep_gbp",
        type: "bank",
        currency: "GBP",
        addressOrDetails: "SmartSwap Ltd, Barclays Bank, Sort Code: 20-00-00, Acc: 11223344",
        isActive: true
      }
    ];
    const initialPrices = [
      { currencyPair: "BTC/USD", rate: 68450, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
      { currencyPair: "ETH/USD", rate: 3450, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
      { currencyPair: "SOL/USD", rate: 168.5, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
      { currencyPair: "USDT/USD", rate: 1, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
      { currencyPair: "USD/EUR", rate: 0.92, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() },
      { currencyPair: "USD/GBP", rate: 0.79, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }
    ];
    const initialAssets = [
      { code: "BTC", name: "Bitcoin", type: "crypto", isActive: true, rateToUSD: 68450, iconBg: "bg-amber-100 text-amber-600 border-amber-200" },
      { code: "ETH", name: "Ethereum", type: "crypto", isActive: true, rateToUSD: 3450, iconBg: "bg-indigo-100 text-indigo-600 border-indigo-200" },
      { code: "SOL", name: "Solana", type: "crypto", isActive: true, rateToUSD: 168.5, iconBg: "bg-purple-100 text-purple-600 border-purple-200" },
      { code: "USDT", name: "Tether USD", type: "crypto", isActive: true, rateToUSD: 1, iconBg: "bg-teal-100 text-teal-600 border-teal-200" },
      { code: "USD", name: "US Dollar", type: "fiat", isActive: true, rateToUSD: 1, iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200" },
      { code: "EUR", name: "Euro Coin", type: "fiat", isActive: true, rateToUSD: 1.087, iconBg: "bg-blue-100 text-blue-600 border-blue-200" },
      { code: "GBP", name: "British Pound", type: "fiat", isActive: true, rateToUSD: 1.266, iconBg: "bg-rose-100 text-rose-600 border-rose-200" }
    ];
    this.data = {
      users: initialUsers,
      transactions: [],
      depositDetails: initialDepositDetails,
      prices: initialPrices,
      assets: initialAssets
    };
    this.saveToDisk();
  }
  saveToDisk() {
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing to Database File:", err);
    }
  }
  // Synchronise Memory and Local Database Store with MongoDB Atlas Collections
  async syncWithMongoDB() {
    if (import_mongoose.default.connection.readyState !== 1) {
      console.log("Mongoose is not connected. Skipping MongoDB sync.");
      return;
    }
    try {
      console.log("Synchronising data memory/local file with MongoDB Atlas...");
      const mongoUsers = await UserModel.find({}).lean();
      if (mongoUsers && mongoUsers.length > 0) {
        console.log(`Loaded ${mongoUsers.length} users from MongoDB.`);
        this.data.users = mongoUsers.map((u) => {
          const balancesRecord = {};
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
            cryptoWallets: (u.cryptoWallets || []).map((w) => ({
              id: w.id,
              currency: w.currency,
              address: w.address,
              label: w.label
            })),
            bankAccounts: (u.bankAccounts || []).map((b) => ({
              id: b.id,
              bankName: b.bankName,
              accountNumber: b.accountNumber,
              routingNumber: b.routingNumber,
              label: b.label
            })),
            balances: balancesRecord,
            createdAt: u.createdAt || (/* @__PURE__ */ new Date()).toISOString()
          };
        });
      }
      this.ensureDefaultUsers();
      for (const u of this.data.users) {
        await UserModel.updateOne({ email: u.email.toLowerCase() }, { $set: u }, { upsert: true });
      }
      const mongoDepositDetails = await DepositDetailModel.find({}).lean();
      if (mongoDepositDetails && mongoDepositDetails.length > 0) {
        console.log(`Loaded ${mongoDepositDetails.length} deposit details from MongoDB.`);
        this.data.depositDetails = mongoDepositDetails.map((d) => ({
          id: d.id,
          type: d.type,
          currency: d.currency,
          addressOrDetails: d.addressOrDetails,
          isActive: d.isActive
        }));
      } else {
        console.log("MongoDB has no deposit details. Seeding deposit details to MongoDB...");
        for (const d of this.data.depositDetails) {
          await DepositDetailModel.create(d);
        }
      }
      const mongoPrices = await PriceModel.find({}).lean();
      if (mongoPrices && mongoPrices.length > 0) {
        console.log(`Loaded ${mongoPrices.length} live prices from MongoDB.`);
        this.data.prices = mongoPrices.map((p) => ({
          currencyPair: p.currencyPair,
          rate: Number(p.rate),
          lastUpdated: p.lastUpdated
        }));
      } else {
        console.log("MongoDB has no prices. Seeding active prices to MongoDB...");
        for (const p of this.data.prices) {
          await PriceModel.create(p);
        }
      }
      const mongoTransactions = await TransactionModel.find({}).lean();
      if (mongoTransactions && mongoTransactions.length > 0) {
        console.log(`Loaded ${mongoTransactions.length} transactions from MongoDB.`);
        this.data.transactions = mongoTransactions.map((tx) => ({
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
          updatedAt: tx.updatedAt
        }));
      } else {
        console.log("MongoDB has no transactions. Seeding local transactions to MongoDB...");
        for (const tx of this.data.transactions) {
          await TransactionModel.create(tx);
        }
      }
      const mongoAssets = await AssetModel.find({}).lean();
      if (mongoAssets && mongoAssets.length > 0) {
        console.log(`Loaded ${mongoAssets.length} assets from MongoDB.`);
        this.data.assets = mongoAssets.map((a) => ({
          code: a.code,
          name: a.name,
          type: a.type,
          isActive: a.isActive !== false,
          rateToUSD: Number(a.rateToUSD),
          iconBg: a.iconBg
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
  getUsers() {
    const assets = this.getAssets();
    this.data.users.forEach((u) => {
      if (u && u.balances) {
        assets.forEach((a) => {
          if (u.balances[a.code] === void 0) {
            u.balances[a.code] = 0;
          }
        });
      }
    });
    return this.data.users;
  }
  getUserById(id) {
    const user = this.data.users.find((u) => u.id === id);
    if (user && user.balances) {
      const assets = this.getAssets();
      assets.forEach((a) => {
        if (user.balances[a.code] === void 0) {
          user.balances[a.code] = 0;
        }
      });
    }
    return user;
  }
  getUserByEmail(email) {
    const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.balances) {
      const assets = this.getAssets();
      assets.forEach((a) => {
        if (user.balances[a.code] === void 0) {
          user.balances[a.code] = 0;
        }
      });
    }
    return user;
  }
  createUser(user) {
    const initialBalances = {};
    this.getAssets().forEach((a) => {
      initialBalances[a.code] = 0;
    });
    const newUser = {
      ...user,
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      isEmailVerified: false,
      emailVerificationCode: Math.floor(1e5 + Math.random() * 9e5).toString(),
      emailVerificationToken: Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11),
      cryptoWallets: [],
      bankAccounts: [],
      balances: initialBalances,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.users.push(newUser);
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      UserModel.create(newUser).catch((err) => console.error("Error writing user to Mongo:", err));
    }
    return newUser;
  }
  updateUser(id, updates) {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return void 0;
    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates
    };
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      UserModel.updateOne({ id }, { $set: updates }).catch(
        (err) => console.error("Error writing user update to Mongo:", err)
      );
    }
    return this.data.users[userIndex];
  }
  // --- Deposit Details CRUD ---
  getDepositDetails() {
    return this.data.depositDetails;
  }
  getDepositDetailById(id) {
    return this.data.depositDetails.find((d) => d.id === id);
  }
  createDepositDetail(detail) {
    const newDetail = {
      ...detail,
      id: "dep_" + Math.random().toString(36).substr(2, 9)
    };
    this.data.depositDetails.push(newDetail);
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      DepositDetailModel.create(newDetail).catch(
        (err) => console.error("Error creating deposit detail in Mongo:", err)
      );
    }
    return newDetail;
  }
  updateDepositDetail(id, updates) {
    const index = this.data.depositDetails.findIndex((d) => d.id === id);
    if (index === -1) return void 0;
    this.data.depositDetails[index] = {
      ...this.data.depositDetails[index],
      ...updates
    };
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      DepositDetailModel.updateOne({ id }, { $set: updates }).catch(
        (err) => console.error("Error modifying deposit detail in Mongo:", err)
      );
    }
    return this.data.depositDetails[index];
  }
  // --- Transactions CRUD ---
  getTransactions() {
    return [...this.data.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getTransactionsByUserId(userId) {
    return this.data.transactions.filter((t) => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getTransactionById(id) {
    return this.data.transactions.find((t) => t.id === id);
  }
  createTransaction(tx) {
    const newTx = {
      ...tx,
      id: "tx_" + Math.random().toString(36).substr(2, 12).toUpperCase(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.transactions.push(newTx);
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      TransactionModel.create(newTx).catch(
        (err) => console.error("Error writing transaction record to Mongo:", err)
      );
    }
    return newTx;
  }
  updateTransactionStatus(id, status) {
    const index = this.data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return void 0;
    const tx = this.data.transactions[index];
    tx.status = status;
    tx.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
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
    if (import_mongoose.default.connection.readyState === 1) {
      TransactionModel.updateOne({ id }, { $set: { status, updatedAt: tx.updatedAt } }).catch(
        (err) => console.error("Error writing transaction status update to Mongo:", err)
      );
    }
    return tx;
  }
  // --- Prices CRUD ---
  getPrices() {
    return this.data.prices;
  }
  updatePrice(currencyPair, rate) {
    const index = this.data.prices.findIndex((p) => p.currencyPair === currencyPair);
    const updatedTime = (/* @__PURE__ */ new Date()).toISOString();
    if (index !== -1) {
      this.data.prices[index].rate = rate;
      this.data.prices[index].lastUpdated = updatedTime;
    } else {
      this.data.prices.push({
        currencyPair,
        rate,
        lastUpdated: updatedTime
      });
    }
    const [base, quote] = currencyPair.split("/");
    if (base && quote && this.data.assets) {
      if (quote === "USD") {
        const assetIndex = this.data.assets.findIndex((a) => a.code.toUpperCase() === base.toUpperCase());
        if (assetIndex !== -1) {
          const oldRate = this.data.assets[assetIndex].rateToUSD;
          if (oldRate !== rate) {
            this.data.assets[assetIndex].rateToUSD = rate;
            if (import_mongoose.default.connection.readyState === 1) {
              AssetModel.updateOne({ code: base.toUpperCase() }, { $set: { rateToUSD: rate } }).catch(
                (err) => console.error("Error updating asset rate to Mongo:", err)
              );
            }
          }
        }
      } else if (base === "USD" && rate > 0) {
        const assetIndex = this.data.assets.findIndex((a) => a.code.toUpperCase() === quote.toUpperCase());
        if (assetIndex !== -1) {
          const inverseRate = Number((1 / rate).toFixed(6));
          const oldRate = this.data.assets[assetIndex].rateToUSD;
          if (oldRate !== inverseRate) {
            this.data.assets[assetIndex].rateToUSD = inverseRate;
            if (import_mongoose.default.connection.readyState === 1) {
              AssetModel.updateOne({ code: quote.toUpperCase() }, { $set: { rateToUSD: inverseRate } }).catch(
                (err) => console.error("Error updating asset rate to Mongo:", err)
              );
            }
          }
        }
      }
    }
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      PriceModel.updateOne(
        { currencyPair },
        { $set: { rate, lastUpdated: updatedTime } },
        { upsert: true }
      ).catch((err) => console.error("Error syncing live spot rates to Mongo:", err));
    }
  }
  // --- Assets CRUD ---
  getAssets() {
    if (!this.data.assets) {
      this.data.assets = [];
    }
    return this.data.assets;
  }
  createAsset(asset) {
    if (!this.data.assets) {
      this.data.assets = [];
    }
    const newAsset = {
      ...asset,
      isActive: asset.isActive !== false,
      iconBg: asset.iconBg || "bg-slate-100 text-slate-600 border-slate-200"
    };
    this.data.assets.push(newAsset);
    this.updatePrice(`${newAsset.code}/USD`, newAsset.rateToUSD);
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      AssetModel.create(newAsset).catch(
        (err) => console.error("Error creating asset in Mongo:", err)
      );
    }
    return newAsset;
  }
  updateAsset(code, updates) {
    if (!this.data.assets) return void 0;
    const index = this.data.assets.findIndex((a) => a.code.toUpperCase() === code.toUpperCase());
    if (index === -1) return void 0;
    this.data.assets[index] = {
      ...this.data.assets[index],
      ...updates
    };
    if (updates.rateToUSD !== void 0) {
      this.updatePrice(`${code.toUpperCase()}/USD`, updates.rateToUSD);
    }
    this.saveToDisk();
    if (import_mongoose.default.connection.readyState === 1) {
      AssetModel.updateOne({ code: code.toUpperCase() }, { $set: updates }).catch(
        (err) => console.error("Error updating asset in Mongo:", err)
      );
    }
    return this.data.assets[index];
  }
};
var dbStore = new DbStore();

// server/authController.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// server/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
async function sendVerificationEmail(email, name, code, token) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : void 0;
  let senderAddress = process.env.SMTP_FROM;
  if (!senderAddress) {
    if (smtpUser) {
      senderAddress = `"SmartSwap" <${smtpUser}>`;
    } else {
      senderAddress = `"SmartSwap" <no-reply@smartswap.com>`;
    }
  }
  const emailSubject = "Verify Your SmartSwap Account";
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.025em;">SmartSwap</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Premium Cross-Chain Exchange</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5; color: #334155;">Hello <strong>${name}</strong>,</p>
      
      <p style="font-size: 15px; line-height: 1.5; color: #334155;">
        Thank you for choosing SmartSwap! To start exchanging with zero-slippage quotes and managing your cross-chain assets, please verify your email address by entering the 6-digit verification code below in the verification screen.
      </p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 500; text-transform: uppercase;">Your 6-Digit Verification Code</p>
        <div style="font-size: 32px; font-weight: bold; color: #0f172a; letter-spacing: 0.15em; font-family: monospace;">${code}</div>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; text-align: center; margin: 0;">
        If you did not sign up for a SmartSwap account, please disregard this email.<br />
        &copy; 2026 SmartSwap Corp. All rights reserved.
      </p>
    </div>
  `;
  const isGmail = smtpHost === "smtp.gmail.com" || smtpUser && smtpUser.endsWith("@gmail.com") || process.env.SMTP_SERVICE && process.env.SMTP_SERVICE.toLowerCase() === "gmail";
  if (isGmail && smtpUser && smtpPass) {
    try {
      console.log(`[SMTP] Initializing dedicated Gmail SMTP service configuration for ${smtpUser}...`);
      const transporter = import_nodemailer.default.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass
          // User's Gmail App Password (highly recommended)
        }
      });
      await transporter.sendMail({
        from: senderAddress,
        to: email,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`[SMTP-GMAIL] Verification email sent successfully to: ${email}`);
      return true;
    } catch (err) {
      console.error("[SMTP-GMAIL] Error sending email via Gmail transport:", err);
    }
  } else if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = import_nodemailer.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      await transporter.sendMail({
        from: senderAddress,
        to: email,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`[SMTP] Verification email sent successfully to: ${email}`);
      return true;
    } catch (err) {
      console.error("[SMTP] Error sending email via SMTP transport:", err);
    }
  }
  console.log(`
==================================================================`);
  console.log(`[EMAIL COMPILATION SANDBOX / DEV FALLBACK]`);
  console.log(`To enable real email routing, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env`);
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: ${emailSubject}`);
  console.log(`CODE: ${code}`);
  console.log(`==================================================================
`);
  return false;
}

// server/security.ts
function sanitizeString(val) {
  if (!val) return "";
  let clean = val;
  clean = clean.replace(/<[^>]*>/g, "");
  clean = clean.replace(/javascript:/gi, "");
  clean = clean.replace(/onload|onerror|onclick|onmouseover/gi, "");
  clean = clean.replace(/[{}\[\]$]/g, "");
  return clean.trim();
}
function sanitizePayload(data) {
  if (data === null || data === void 0) return data;
  if (typeof data === "string") {
    return sanitizeString(data);
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item));
  }
  if (typeof data === "object") {
    const sanitizedObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const safeKey = key.replace(/^\$/, "");
        sanitizedObj[safeKey] = sanitizePayload(data[key]);
      }
    }
    return sanitizedObj;
  }
  return data;
}
function sanitizeInputMiddleware(req, res, next) {
  req.body = sanitizePayload(req.body);
  req.query = sanitizePayload(req.query);
  req.params = sanitizePayload(req.params);
  next();
}
var rateLimitStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 36e5);
    if (record.timestamps.length === 0 && (!record.bannedUntil || record.bannedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}, 3e5);
function rateLimiter(options) {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown_client";
    const key = `${ip}:${options.sensitive ? "sensitive" : "generic"}`;
    const now = Date.now();
    let record = rateLimitStore.get(key);
    if (!record) {
      record = { timestamps: [] };
      rateLimitStore.set(key, record);
    }
    if (record.bannedUntil && record.bannedUntil > now) {
      const remainingBan = Math.ceil((record.bannedUntil - now) / 1e3);
      res.status(429).json({
        success: false,
        message: `Too many malicious attempts detected from this IP. Temporarily blocked for ${remainingBan} more seconds.`
      });
      return;
    }
    record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);
    if (record.timestamps.length >= options.max * 3.5) {
      record.bannedUntil = now + 9e5;
      res.status(429).json({
        success: false,
        message: "Maximum security threshold exceeded. Dynamic brute-force firewall has banned your IP address for 15 minutes."
      });
      return;
    }
    if (record.timestamps.length >= options.max) {
      res.status(429).json({
        success: false,
        message: "Too many concurrent requests originating from your network coordinates. Please slow down and try again."
      });
      return;
    }
    record.timestamps.push(now);
    next();
  };
}
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin.startsWith("http://localhost:") || origin.startsWith("https://localhost:") || origin.includes("127.0.0.1")) {
    return true;
  }
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && (origin === allowed || origin.startsWith(allowed))) {
    return true;
  }
  if (origin.includes(".europe-west2.run.app") || origin.includes(".run.app") || origin.endsWith(".google.app") || origin.includes("ai.studio/build") || origin.includes(".vercel.app") || origin.includes("vercel")) {
    return true;
  }
  return false;
}
function secureCorsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.header("Access-Control-Allow-Origin", "*");
  } else {
    res.header("Access-Control-Allow-Origin", "null");
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Secure-Token");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}
function validatePasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, reason: "Password is too weak. Must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one alpha character." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one numeric digit." };
  }
  return { valid: true };
}
function validateEmailString(email) {
  if (!email || typeof email !== "string") return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}
function parseAndValidateAmount(raw, currencyName = "Asset") {
  const amountStr = String(raw).trim();
  const parsed = parseFloat(amountStr);
  if (isNaN(parsed)) {
    return { valid: false, parsed: 0, error: `Invalid ${currencyName} allocation: input is not a number.` };
  }
  if (parsed <= 0) {
    return { valid: false, parsed: 0, error: `Transaction abort: ${currencyName} allocation must be greater than zero.` };
  }
  if (!isFinite(parsed) || parsed > 1e11) {
    return { valid: false, parsed: 0, error: `Transaction abort: excessive ${currencyName} allocation exceeding safety protocol parameters.` };
  }
  return { valid: true, parsed };
}

// server/authController.ts
var JWT_SECRET = process.env.JWT_SECRET || "smartswap_fallback_super_secret_jwt_key_2026";
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Please provide name, email and password." });
      return;
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      res.status(400).json({ success: false, message: "Name must be between 2 and 50 characters." });
      return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmailString(trimmedEmail)) {
      res.status(400).json({ success: false, message: "Invalid email address format entered." });
      return;
    }
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
    const salt = await import_bcryptjs2.default.genSalt(10);
    const passwordHash = await import_bcryptjs2.default.hash(password, salt);
    const newUser = dbStore.createUser({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      role: "user"
      // defaults to customer
    });
    sendVerificationEmail(
      newUser.email,
      newUser.name,
      newUser.emailVerificationCode || "",
      newUser.emailVerificationToken || ""
    ).catch((err) => {
      console.error("Failed to send verification email asynchronously:", err);
    });
    const token = import_jsonwebtoken.default.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: "Registration successful! A verification code has been sent to your email.",
      data: {
        token,
        user: safeUser
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Internal server error occurred.", error: error.message });
  }
}
async function login(req, res) {
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
    const isMatch = await import_bcryptjs2.default.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }
    const token = import_jsonwebtoken.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    if (!user.isEmailVerified) {
      let verificationCode = user.emailVerificationCode;
      let verificationToken = user.emailVerificationToken;
      if (!verificationCode) {
        verificationCode = Math.floor(1e5 + Math.random() * 9e5).toString();
        verificationToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
        dbStore.updateUser(user.id, {
          emailVerificationCode: verificationCode,
          emailVerificationToken: verificationToken
        });
      }
      console.log(`[LOGIN-AUTOSEND] Dispatching verification email automatically to unverified user: ${user.email}`);
      sendVerificationEmail(user.email, user.name, verificationCode, verificationToken || "").catch((err) => {
        console.error("Login automatic verification email dispatch failed:", err);
      });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token,
        user: safeUser
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
async function getMe(req, res) {
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
      data: safeUser
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile info." });
  }
}
async function verifyCode(req, res) {
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
    dbStore.updateUser(user.id, { isEmailVerified: true });
    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in or trade.",
      data: { success: true }
    });
  } catch (error) {
    console.error("verifyCode Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
async function verifyEmailLink(req, res) {
  try {
    const email = req.query.email;
    const token = req.query.token;
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
    dbStore.updateUser(user.id, { isEmailVerified: true });
    res.status(200).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px; padding: 40px; max-width: 500px; margin-left: auto; margin-right: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="display: inline-block; background-color: #d1fae5; color: #065f46; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; font-size: 32px; font-weight: bold; margin-bottom: 24px;">&check;</div>
        <h1 style="color: #0f172a; margin-bottom: 8px; font-size: 24px; font-weight: bold;">Email Verified!</h1>
        <p style="color: #475569; font-size: 15px; margin-bottom: 32px; line-height: 1.5;">Your email has been successfully verified. You now have full access to trading rates, cross-chain swaps, and security configurations.</p>
        <p style="font-size: 13px; color: #94a3b8;">You may close this window and sign in inside the app.</p>
      </div>
    `);
  } catch (error) {
    console.error("verifyEmailLink Error:", error);
    res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h2 style="color: #ef4444;">Internal Server Error</h2>
        <p>An error occurred while verifying your email.</p>
      </div>
    `);
  }
}
async function resendCode(req, res) {
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
    const newCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const newToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
    dbStore.updateUser(user.id, {
      emailVerificationCode: newCode,
      emailVerificationToken: newToken
    });
    sendVerificationEmail(user.email, user.name, newCode, newToken).catch((err) => {
      console.error("Resend async email failed:", err);
    });
    res.status(200).json({
      success: true,
      message: "A new verification code has been dispatched to your email address.",
      data: { success: true }
    });
  } catch (error) {
    console.error("resendCode Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// server/userController.ts
function addCryptoWallet(req, res) {
  try {
    const userId = req.user?.id;
    const { currency, address, label } = req.body;
    if (!currency || !address || !label) {
      res.status(400).json({ success: false, message: "Missing required fields (currency, address, label)." });
      return;
    }
    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    const newWallet = {
      id: "wlt_" + Math.random().toString(36).substr(2, 9),
      currency,
      address,
      label
    };
    const updatedWallets = [...user.cryptoWallets, newWallet];
    dbStore.updateUser(userId, { cryptoWallets: updatedWallets });
    res.status(200).json({
      success: true,
      message: "Crypto wallet payout destination added successfully!",
      data: newWallet
    });
  } catch (error) {
    console.error("Add Crypto Wallet Error:", error);
    res.status(500).json({ success: false, message: "Failed to add crypto address." });
  }
}
function addBankAccount(req, res) {
  try {
    const userId = req.user?.id;
    const { bankName, accountNumber, routingNumber, label } = req.body;
    if (!bankName || !accountNumber || !routingNumber || !label) {
      res.status(400).json({ success: false, message: "Missing required details (bankName, accountNumber, routingNumber, label)." });
      return;
    }
    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    const newBank = {
      id: "bnk_" + Math.random().toString(36).substr(2, 9),
      bankName,
      accountNumber,
      routingNumber,
      label
    };
    const updatedBanks = [...user.bankAccounts, newBank];
    dbStore.updateUser(userId, { bankAccounts: updatedBanks });
    res.status(200).json({
      success: true,
      message: "Bank account payout destination added successfully!",
      data: newBank
    });
  } catch (error) {
    console.error("Add Bank Account Error:", error);
    res.status(500).json({ success: false, message: "Failed to add bank account destination." });
  }
}
function getWithdrawalMethods(req, res) {
  try {
    const userId = req.user?.id;
    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        cryptoWallets: user.cryptoWallets,
        bankAccounts: user.bankAccounts,
        balances: user.balances
      }
    });
  } catch (error) {
    console.error("Get Withdrawal Methods Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve payout profiles." });
  }
}

// server/priceService.ts
var broadcastCallback = null;
var intervalId = null;
function registerPriceBroadcast(callback) {
  broadcastCallback = callback;
}
function calculateSwapRate(fromCur, toCur) {
  if (fromCur === toCur) return 1;
  const prices = dbStore.getPrices();
  const getUSDValue = (currency) => {
    const currencyUpper = currency.toUpperCase();
    if (currencyUpper === "USD") return 1;
    const directPair = prices.find((p) => p.currencyPair === `${currencyUpper}/USD`);
    if (directPair) {
      return directPair.rate;
    }
    const inversePair = prices.find((p) => p.currencyPair === `USD/${currencyUpper}`);
    if (inversePair) {
      return 1 / inversePair.rate;
    }
    const asset = dbStore.getAssets().find((a) => a.code.toUpperCase() === currencyUpper);
    if (asset) {
      return asset.rateToUSD;
    }
    return 1;
  };
  const fromInUSD = getUSDValue(fromCur);
  const usdToCurrencyRate = (currency) => {
    const currencyUpper = currency.toUpperCase();
    if (currencyUpper === "USD") return 1;
    const directPair = prices.find((p) => p.currencyPair === `${currencyUpper}/USD`);
    if (directPair) {
      return 1 / directPair.rate;
    }
    const inversePair = prices.find((p) => p.currencyPair === `USD/${currencyUpper}`);
    if (inversePair) {
      return inversePair.rate;
    }
    const asset = dbStore.getAssets().find((a) => a.code.toUpperCase() === currencyUpper);
    if (asset) {
      return 1 / asset.rateToUSD;
    }
    return 1;
  };
  const finalRate = fromInUSD * usdToCurrencyRate(toCur);
  return Number(finalRate.toFixed(8));
}
function simulatePriceTick() {
  const prices = dbStore.getPrices();
  const assets = dbStore.getAssets();
  prices.forEach((pair) => {
    const baseCode = pair.currencyPair.split("/")[0];
    const asset = assets.find((a) => a.code.toUpperCase() === baseCode.toUpperCase());
    const isCrypto = asset ? asset.type === "crypto" : pair.currencyPair.startsWith("BTC") || pair.currencyPair.startsWith("ETH") || pair.currencyPair.startsWith("SOL");
    const volatility = isCrypto ? 15e-4 : 3e-4;
    const direction = Math.random() > 0.48 ? 1 : -1;
    const changePercent = Math.random() * volatility;
    const newRate = pair.rate * (1 + direction * changePercent);
    dbStore.updatePrice(pair.currencyPair, Number(newRate.toFixed(isCrypto ? 2 : 4)));
  });
  if (broadcastCallback) {
    broadcastCallback(dbStore.getPrices());
  }
}
var lastRealFetchTime = Date.now();
function startPriceService() {
  if (intervalId) return;
  console.log("Starting Real-time Price Service...");
  fetchRealPrices().catch((err) => console.error("Initial real-world price fetch failed:", err));
  intervalId = setInterval(() => {
    if (Date.now() - lastRealFetchTime > 6e4) {
      console.log("Periodic trigger: synchronising with real-world market pricing...");
      fetchRealPrices().catch((err) => console.error("Periodic real-world price fetch failed:", err));
    } else {
      simulatePriceTick();
    }
  }, 2e3);
}
async function fetchRealPrices() {
  lastRealFetchTime = Date.now();
  try {
    console.log("Fetching live real-time market price rates from Coinbase...");
    const cbRes = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD");
    if (!cbRes.ok) throw new Error(`Coinbase response status: ${cbRes.status}`);
    const cbData = await cbRes.json();
    if (cbData && cbData.data && cbData.data.rates) {
      const rates = cbData.data.rates;
      if (rates.BTC && Number(rates.BTC) > 0) {
        dbStore.updatePrice("BTC/USD", Number((1 / Number(rates.BTC)).toFixed(2)));
      }
      if (rates.ETH && Number(rates.ETH) > 0) {
        dbStore.updatePrice("ETH/USD", Number((1 / Number(rates.ETH)).toFixed(2)));
      }
      if (rates.SOL && Number(rates.SOL) > 0) {
        dbStore.updatePrice("SOL/USD", Number((1 / Number(rates.SOL)).toFixed(2)));
      }
      if (rates.USDT && Number(rates.USDT) > 0) {
        dbStore.updatePrice("USDT/USD", Number((1 / Number(rates.USDT)).toFixed(4)));
      } else {
        dbStore.updatePrice("USDT/USD", 1);
      }
      if (rates.EUR && Number(rates.EUR) > 0) {
        dbStore.updatePrice("USD/EUR", Number(Number(rates.EUR).toFixed(4)));
      }
      if (rates.GBP && Number(rates.GBP) > 0) {
        dbStore.updatePrice("USD/GBP", Number(Number(rates.GBP).toFixed(4)));
      }
      console.log("Live real-time market price rates successfully updated from Coinbase!");
      if (broadcastCallback) {
        broadcastCallback(dbStore.getPrices());
      }
      return;
    }
    throw new Error("Coinbase data rates payload is empty");
  } catch (cbErr) {
    console.log("Coinbase lookup failed, trying fallback APIs...", cbErr);
  }
  try {
    console.log("Fetching live real-time market price rates from CryptoCompare/Frankfurter fallbacks...");
    const cryptoRes = await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SOL,USDT&tsyms=USD");
    const cryptoData = await cryptoRes.json();
    if (cryptoData && cryptoData.BTC && cryptoData.BTC.USD) {
      dbStore.updatePrice("BTC/USD", Number(cryptoData.BTC.USD));
    }
    if (cryptoData && cryptoData.ETH && cryptoData.ETH.USD) {
      dbStore.updatePrice("ETH/USD", Number(cryptoData.ETH.USD));
    }
    if (cryptoData && cryptoData.SOL && cryptoData.SOL.USD) {
      dbStore.updatePrice("SOL/USD", Number(cryptoData.SOL.USD));
    }
    if (cryptoData && cryptoData.USDT && cryptoData.USDT.USD) {
      dbStore.updatePrice("USDT/USD", Number(cryptoData.USDT.USD));
    }
    const fiatRes = await fetch("https://api.frankfurter.app/latest?from=USD&symbols=EUR,GBP");
    const fiatData = await fiatRes.json();
    if (fiatData && fiatData.rates) {
      if (fiatData.rates.EUR) {
        dbStore.updatePrice("USD/EUR", Number(fiatData.rates.EUR));
      }
      if (fiatData.rates.GBP) {
        dbStore.updatePrice("USD/GBP", Number(fiatData.rates.GBP));
      }
    }
    console.log("Live real-time market price rates successfully updated!");
  } catch (err) {
    console.error("Warning: Failed to fetch real-world price rates from public APIs, falling back to local simulation:", err);
    simulatePriceTick();
  }
  if (broadcastCallback) {
    broadcastCallback(dbStore.getPrices());
  }
}
async function forcePriceSync() {
  console.log("Admin triggering manual price synchronisation!");
  await fetchRealPrices();
  return dbStore.getPrices();
}

// server/swapController.ts
var import_genai = require("@google/genai");
function getQuote(req, res) {
  try {
    const { fromCurrency, toCurrency, amount } = req.query;
    if (!fromCurrency || !toCurrency || !amount) {
      res.status(400).json({ success: false, message: "Missing query parameters: fromCurrency, toCurrency, amount." });
      return;
    }
    const { valid, parsed: parsedAmount, error } = parseAndValidateAmount(amount, "exchange amount");
    if (!valid) {
      res.status(400).json({ success: false, message: error || "Invalid quantity specified." });
      return;
    }
    const rate = calculateSwapRate(fromCurrency, toCurrency);
    const toAmount = parsedAmount * rate;
    res.status(200).json({
      success: true,
      data: {
        fromCurrency,
        toCurrency,
        fromAmount: parsedAmount,
        toAmount: Number(toAmount.toFixed(8)),
        rate
      }
    });
  } catch (error) {
    console.error("Get Quote Error:", error);
    res.status(500).json({ success: false, message: "Failed to calculate exchange quote." });
  }
}
function createSwapTransaction(req, res) {
  try {
    const userId = req.user?.id;
    const { fromCurrency, toCurrency, fromAmount, withdrawMethodId } = req.body;
    if (!fromCurrency || !toCurrency || !fromAmount || !withdrawMethodId) {
      res.status(400).json({ success: false, message: "Missing fields (fromCurrency, toCurrency, fromAmount, withdrawMethodId)." });
      return;
    }
    const { valid, parsed: parsedAmount, error } = parseAndValidateAmount(fromAmount, "funding allocation");
    if (!valid) {
      res.status(400).json({ success: false, message: error || "Invalid swap amount." });
      return;
    }
    const user = dbStore.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User profile not found." });
      return;
    }
    const currentBalance = user.balances[fromCurrency] || 0;
    if (currentBalance < parsedAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient funds. Your simulated ${fromCurrency} balance is ${currentBalance.toFixed(5)}, but you tried to swap ${parsedAmount.toFixed(5)}.`
      });
      return;
    }
    let withdrawDetails = user.cryptoWallets.find((w) => w.id === withdrawMethodId);
    if (!withdrawDetails) {
      withdrawDetails = user.bankAccounts.find((b) => b.id === withdrawMethodId);
    }
    if (!withdrawDetails) {
      res.status(400).json({ success: false, message: "Selected withdrawal method or payout profile was not found." });
      return;
    }
    const adminDeposits = dbStore.getDepositDetails();
    let depositDetails = adminDeposits.find((d) => d.currency === fromCurrency && d.isActive);
    if (!depositDetails) {
      depositDetails = dbStore.createDepositDetail({
        type: ["USD", "EUR", "GBP"].includes(fromCurrency) ? "bank" : "crypto",
        currency: fromCurrency,
        addressOrDetails: ["USD", "EUR", "GBP"].includes(fromCurrency) ? `Temp Admin ${fromCurrency} Bank Account: SS-MOCK-9921` : `Temp Admin ${fromCurrency} Wallet: 0xMOCK_ADDR_DYNAMIC_KEY_SS_2026`,
        isActive: true
      });
    }
    const rate = calculateSwapRate(fromCurrency, toCurrency);
    const toAmount = parsedAmount * rate;
    const newTx = dbStore.createTransaction({
      userId,
      userEmail: user.email,
      fromCurrency,
      toCurrency,
      fromAmount: parsedAmount,
      toAmount: Number(toAmount.toFixed(8)),
      rate,
      status: "pending",
      depositDetails,
      withdrawDetails
    });
    res.status(201).json({
      success: true,
      message: "Swap transaction initiated successfully!",
      data: newTx
    });
  } catch (error) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({ success: false, message: "Failed to create swap transaction." });
  }
}
function getUserTransactions(req, res) {
  try {
    const userId = req.user?.id;
    const transactions = dbStore.getTransactionsByUserId(userId);
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error("Get User Transactions Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transaction histories." });
  }
}

// server/adminController.ts
function getAllUsers(req, res) {
  try {
    const users = dbStore.getUsers();
    const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
    res.status(200).json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve user accounts." });
  }
}
function getAllTransactions(req, res) {
  try {
    const transactions = dbStore.getTransactions();
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error("Admin Get Transactions Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve transaction records." });
  }
}
function updateTransactionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status || !["pending", "completed", "failed"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid transaction reference or state." });
      return;
    }
    const tx = dbStore.getTransactionById(id);
    if (!tx) {
      res.status(404).json({ success: false, message: "Transaction record was not found." });
      return;
    }
    if (tx.status !== "pending") {
      res.status(400).json({ success: false, message: `Transaction is already finalized as: ${tx.status}` });
      return;
    }
    const updatedTx = dbStore.updateTransactionStatus(id, status);
    res.status(200).json({
      success: true,
      message: `Transaction state successfully updated to: ${status}!`,
      data: updatedTx
    });
  } catch (error) {
    console.error("Admin Update Transaction Error:", error);
    res.status(500).json({ success: false, message: "Failed to update transaction status." });
  }
}
function addDepositDetail(req, res) {
  try {
    const { type, currency, addressOrDetails } = req.body;
    if (!type || !currency || !addressOrDetails) {
      res.status(400).json({ success: false, message: "Missing required fields (type, currency, addressOrDetails)." });
      return;
    }
    const newDeposit = dbStore.createDepositDetail({
      type,
      currency,
      addressOrDetails,
      isActive: true
    });
    res.status(201).json({
      success: true,
      message: "Admin deposit method successfully configured!",
      data: newDeposit
    });
  } catch (error) {
    console.error("Add Deposit Detail Error:", error);
    res.status(500).json({ success: false, message: "Failed to set up deposit method." });
  }
}
function updateDepositDetailStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      res.status(400).json({ success: false, message: "isActive state must be boolean." });
      return;
    }
    const updated = dbStore.updateDepositDetail(id, { isActive });
    if (!updated) {
      res.status(404).json({ success: false, message: "Deposit method not found." });
      return;
    }
    res.status(200).json({
      success: true,
      message: `Deposit active state updated to: ${isActive}`,
      data: updated
    });
  } catch (error) {
    console.error("Update Deposit Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to modify deposit active state." });
  }
}
async function syncPrices(req, res) {
  try {
    const updatedPrices = await forcePriceSync();
    res.status(200).json({
      success: true,
      message: "External rates manually synchronised and broadcast successfully!",
      data: updatedPrices
    });
  } catch (error) {
    console.error("Admin Sync Prices Error:", error);
    res.status(500).json({ success: false, message: "Price synchronization failed." });
  }
}
function getAssetsList(req, res) {
  try {
    const assets = dbStore.getAssets();
    res.status(200).json({
      success: true,
      data: assets
    });
  } catch (error) {
    console.error("Get Assets Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch supported assets." });
  }
}
function addAsset(req, res) {
  try {
    const { code, name, type, rateToUSD, iconBg } = req.body;
    if (!code || !name || !type || rateToUSD === void 0) {
      res.status(400).json({ success: false, message: "Missing required fields: code, name, type, rateToUSD" });
      return;
    }
    if (!["crypto", "fiat"].includes(type)) {
      res.status(400).json({ success: false, message: "Type must be 'crypto' or 'fiat'" });
      return;
    }
    const existing = dbStore.getAssets().find((a) => a.code.toUpperCase() === code.trim().toUpperCase());
    if (existing) {
      res.status(400).json({ success: false, message: `An asset with code ${code.toUpperCase()} already exists.` });
      return;
    }
    const newAsset = dbStore.createAsset({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      rateToUSD: Number(rateToUSD),
      iconBg: iconBg || "bg-slate-100 text-slate-600 border-slate-200"
    });
    res.status(201).json({
      success: true,
      message: `${type === "crypto" ? "Cryptocurrency" : "Fiat currency"} ${code.toUpperCase()} successfully added!`,
      data: newAsset
    });
  } catch (error) {
    console.error("Admin Add Asset Error:", error);
    res.status(500).json({ success: false, message: "Failed to add asset." });
  }
}
function updateAssetDetails(req, res) {
  try {
    const { code } = req.params;
    const { name, isActive, rateToUSD, iconBg } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: "Missing asset code." });
      return;
    }
    const updated = dbStore.updateAsset(code, {
      ...name !== void 0 && { name: name.trim() },
      ...isActive !== void 0 && { isActive: Boolean(isActive) },
      ...rateToUSD !== void 0 && { rateToUSD: Number(rateToUSD) },
      ...iconBg !== void 0 && { iconBg: iconBg.trim() }
    });
    if (!updated) {
      res.status(404).json({ success: false, message: `Asset ${code.toUpperCase()} not found.` });
      return;
    }
    res.status(200).json({
      success: true,
      message: `Asset ${code.toUpperCase()} successfully updated!`,
      data: updated
    });
  } catch (error) {
    console.error("Admin Update Asset Error:", error);
    res.status(500).json({ success: false, message: "Failed to update asset." });
  }
}

// server/authMiddleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET2 = process.env.JWT_SECRET || "smartswap_fallback_super_secret_jwt_key_2026";
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided, authorization denied." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken2.default.verify(token, JWT_SECRET2);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token is invalid, authorization denied." });
  }
}
function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ success: false, message: "Access denied. Action requires Administrator privileges." });
    }
  });
}

// server/socketManager.ts
var import_socket = require("socket.io");
function initSocketManager(server) {
  const io = new import_socket.Server(server, {
    cors: {
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || isAllowedOrigin(requestOrigin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS Security Block: WebSocket cross-origin connection denied."), false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  io.on("connection", (socket) => {
    socket.emit("price_update", dbStore.getPrices());
    socket.on("disconnect", () => {
    });
  });
  registerPriceBroadcast((prices) => {
    io.emit("price_update", prices);
  });
  return io;
}

// server.ts
import_dotenv.default.config();
async function runFullStackServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    console.log("MongoDB connection string specified. Connecting to MongoDB cluster...");
    try {
      await import_mongoose2.default.connect(mongoUri);
      console.log("Successfully connected to MongoDB Atlas!");
      await dbStore.syncWithMongoDB();
    } catch (err) {
      console.error("Warning: Could not connect to MongoDB Atlas.", err);
      console.log("Gracefully falling back to local JSON file storage.");
    }
  } else {
    console.log("No MONGODB_URI environment variable detected. Defaulting to local File storage.");
  }
  const app = (0, import_express.default)();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const HOST = "0.0.0.0";
  app.use(import_express.default.json({ limit: "15kb" }));
  app.use(secureCorsMiddleware);
  app.use(sanitizeInputMiddleware);
  app.use("/api", rateLimiter({ windowMs: 6e4, max: 100 }));
  const authLimit = rateLimiter({ windowMs: 6e4, max: 8, sensitive: true });
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "SmartSwap fullstack engine operational." });
  });
  app.get("/api/debug/test-smtp", async (req, res) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS ? "********" : "NOT_SET";
    const smtpService = process.env.SMTP_SERVICE;
    try {
      const nodemailer2 = await import("nodemailer");
      console.log("[DEBUG-SMTP] Testing SMTP with configuration:", { smtpHost, smtpPort, smtpUser, smtpPass: "SET", smtpService });
      const isGmail = smtpHost === "smtp.gmail.com" || smtpUser && smtpUser.endsWith("@gmail.com") || smtpService && smtpService.toLowerCase() === "gmail";
      let transporter;
      if (isGmail && smtpUser && process.env.SMTP_PASS) {
        transporter = nodemailer2.default.createTransport({
          service: "gmail",
          auth: {
            user: smtpUser,
            pass: process.env.SMTP_PASS
          }
        });
      } else if (smtpHost && smtpUser && process.env.SMTP_PASS) {
        transporter = nodemailer2.default.createTransport({
          host: smtpHost,
          port: smtpPort ? parseInt(smtpPort) : 587,
          secure: smtpPort === "465",
          auth: {
            user: smtpUser,
            pass: process.env.SMTP_PASS
          }
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
    } catch (err) {
      console.error("[DEBUG-SMTP] Error during test:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Unknown error",
        stack: err.stack,
        config: { smtpHost, smtpPort, smtpUser, smtpPass, smtpService }
      });
    }
  });
  app.get("/api/prices", (req, res) => {
    res.json({ success: true, data: dbStore.getPrices() });
  });
  app.post("/api/auth/register", authLimit, register);
  app.post("/api/auth/login", authLimit, login);
  app.get("/api/auth/me", authMiddleware, getMe);
  app.post("/api/auth/verify-code", authLimit, verifyCode);
  app.get("/api/auth/verify-email", verifyEmailLink);
  app.post("/api/auth/resend-code", authLimit, resendCode);
  app.post("/api/user/wallet", authMiddleware, addCryptoWallet);
  app.post("/api/user/bank", authMiddleware, addBankAccount);
  app.get("/api/user/withdraw-methods", authMiddleware, getWithdrawalMethods);
  app.get("/api/swap/quote", getQuote);
  app.post("/api/swap/transact", authMiddleware, createSwapTransaction);
  app.get("/api/swap/history", authMiddleware, getUserTransactions);
  app.get("/api/assets", authMiddleware, getAssetsList);
  app.get("/api/admin/users", adminMiddleware, getAllUsers);
  app.get("/api/admin/transactions", adminMiddleware, getAllTransactions);
  app.post("/api/admin/transactions/:id/status", adminMiddleware, updateTransactionStatus);
  app.post("/api/admin/deposit", adminMiddleware, addDepositDetail);
  app.post("/api/admin/deposit/:id/status", adminMiddleware, updateDepositDetailStatus);
  app.post("/api/admin/sync-prices", adminMiddleware, syncPrices);
  app.post("/api/admin/assets", adminMiddleware, addAsset);
  app.post("/api/admin/assets/:code", adminMiddleware, updateAssetDetails);
  const server = import_http.default.createServer(app);
  initSocketManager(server);
  startPriceService();
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack dev server in VITE MIDDLEWARE MODE...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Deploying files in static production assets mode...");
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, HOST, () => {
    console.log(`SmartSwap application running live on http://${HOST}:${PORT}`);
  });
}
runFullStackServer().catch((error) => {
  console.error("Critical server startup failure:", error);
});
//# sourceMappingURL=server.cjs.map
