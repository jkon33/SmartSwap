# SmartSwap | Continuous Spot Crypto/Fiat Swap Ledger Engine

SmartSwap is a highly polished, production-ready full-stack cryptocurrency and fiat currency swapping sandbox application designed to run entirely in a sandboxed, containerized, single-port Node.js environment.

It features **instant quoting**, real-time price updates streamed via **Socket.IO**, multi-role user schemas securely authenticated via **JSON Web Tokens (JWT)**, complete customer payout destinations setups, and administrative transacting clearances.

## Core Architectures
- **Single Process Fullstack Runtime**: To conform with container routing constraints, both the React compilation server (Vite middleware) and the REST-WebSocket APIs are bundled together into a single master process running on **Port 3000**.
- **JSON File-Based Engine (`/server/dbStore.ts`)**: Built with a local persistent schema adapter inside `/data/db.json`. It guarantees stateful data structures (users info, balances ledger heights, transaction statuses, depository details) survive server cycles out of the box without requiring external MongoDB installations, while maintaining 100% database code consistency.
- **Dynamic Valuation Conversions**: Market exchanges are anchored on USD and computed bidirectionally (e.g. BTC &rarr; USD &rarr; GBP), supporting instantaneous and accurate quotes.

---

## Pre-seeded Sandbox Credentials
To bypass manual registrations, the database initializes with two preseeded accounts (preloaded with active balances):

### 1. Simple Customer / Investor Account
- **Email**: `user@smartswap.com`
- **Password**: `userpassword`
- **Preseeded Balances**: 0.15 BTC, 2.50 ETH, 2,500 USDT, 20 SOL, 10,000 USD, 5,000 EUR, 3,000 GBP

### 2. Administrator Command Account
- **Email**: `admin@smartswap.com`
- **Password**: `adminpassword`
- **Functions**: Settle customer pending swap requests (which adds/deducts user ledger values instantly), edit receipt depositories, and force manual price synchronisations.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Enter Environment Variables
Create a local `.env` copying `.env.example` configurations:
```env
APP_URL="http://localhost:3000"
JWT_SECRET="smartswap_fallback_super_secret_jwt_key_2026"
```

### 3. Run Development Server
Executes the unified Express server in live Vite middleware mode on port 3000:
```bash
npm run dev
```

### 4. Build and Compile Static Assets
Bundles the React client files inside `/dist` and compiles `/server.ts` to a self-contained ES module CommonJS file inside `/dist/server.cjs` using `esbuild`:
```bash
npm run build
```

---

## Real-time Price Simulators
1. Price tickers fluctuation loops kick off on server boot, triggering slight volatility shifts every **2 seconds**.
2. Updated price arrays are emitted via the Socket.IO server under the channel `price_update`.
3. Client custom hook `useRealtimePrices` captures these values and recalculates interface numbers, flashing green/red tags on up/down triggers.
