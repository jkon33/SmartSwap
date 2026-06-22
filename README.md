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
- **Email**: `oluzeun21@gmail.com`
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

---

## 📱 Mobile Platform Compilation (Android & iOS)

SmartSwap features fully integrated **Capacitor** scaffolding to compile and package its intuitive frontend into production-ready native mobile applications for both **Android** and **iOS**.

### Prerequisites
1. **Android**: Install [Android Studio](https://developer.android.com/studio) and ensure you have the Android SDK tools installed.
2. **iOS**: Install Xcode (requires macOS) and CocoaPods.

### Mobile Development Workflow

#### 1. Compile and Sync Assets
This script builds your web app and synchronizes the distribution files (`/dist`) with both native Android and iOS wrapper shells instantly:
```bash
npm run mobile:sync
```

#### 2. Open Native IDE Projects
Open Android Studio or Xcode with the respective native workspace pre-scaffolded:
```bash
# To open the Android project in Android Studio
npm run mobile:open:android

# To open the iOS project in Xcode (macOS only)
npm run mobile:open:ios
```

#### 3. Run Directly on Device or Emulator
Launch and deploy directly from your command-line terminal:
```bash
# Run on an active Android Emulator / Connected Device
npm run mobile:run:android

# Run on an iOS Simulator / Connected Device (macOS only)
npm run mobile:run:ios
```

### Under-the-Hood Mobile Integrations
- **Resilient Navigation**: Since mobile apps run directly in filesystem wrappers (`file://`), standard browser history routers may cause routing faults. SmartSwap natively utilizes React Router's `HashRouter`, making routing fully compatible on all mobile WebViews out of the box.
- **Dynamic API Origin Resolution**: Relative URLs (like `/api`) fail on mobile containers. Inside `src/services/api.ts`, SmartSwap auto-detects if the host is running under Capacitor and redirects queries to our secure hosted deployment backend API: `https://ais-pre-p632kafgq6545hshnzdulb-371764684561.europe-west2.run.app/api`.
