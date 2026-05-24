import { dbStore, Price } from "./dbStore";

// Holds active sockets references or callback to broadcast
type BroadcastCallback = (prices: Price[]) => void;
let broadcastCallback: BroadcastCallback | null = null;
let intervalId: NodeJS.Timeout | null = null;

export function registerPriceBroadcast(callback: BroadcastCallback) {
  broadcastCallback = callback;
}

// Convert fromCurrency -> USD -> toCurrency
export function calculateSwapRate(fromCur: string, toCur: string): number {
  if (fromCur === toCur) return 1.0;

  const prices = dbStore.getPrices();
  
  // Helper to get rate in USD (i.e., How many USD is 1 unit of this currency)
  const getUSDValue = (currency: string): number => {
    const currencyUpper = currency.toUpperCase();
    if (currencyUpper === "USD") return 1.0;
    
    const directPair = prices.find((p) => p.currencyPair === `${currencyUpper}/USD`);
    if (directPair) {
      return directPair.rate;
    }

    const inversePair = prices.find((p) => p.currencyPair === `USD/${currencyUpper}`);
    if (inversePair) {
      return 1.0 / inversePair.rate;
    }

    const asset = dbStore.getAssets().find(a => a.code.toUpperCase() === currencyUpper);
    if (asset) {
      return asset.rateToUSD;
    }

    return 1.0;
  };

  // Convert 1 unit of fromCur to equivalent USD
  const fromInUSD = getUSDValue(fromCur);

  // Convert that USD amount to toCur
  const usdToCurrencyRate = (currency: string): number => {
    const currencyUpper = currency.toUpperCase();
    if (currencyUpper === "USD") return 1.0;
    
    const directPair = prices.find((p) => p.currencyPair === `${currencyUpper}/USD`);
    if (directPair) {
      return 1.0 / directPair.rate;
    }

    const inversePair = prices.find((p) => p.currencyPair === `USD/${currencyUpper}`);
    if (inversePair) {
      return inversePair.rate;
    }

    const asset = dbStore.getAssets().find(a => a.code.toUpperCase() === currencyUpper);
    if (asset) {
      return 1.0 / asset.rateToUSD;
    }

    return 1.0;
  };

  const finalRate = fromInUSD * usdToCurrencyRate(toCur);
  return Number(finalRate.toFixed(8));
}

// Tick simulated price changes
export function simulatePriceTick() {
  const prices = dbStore.getPrices();
  const assets = dbStore.getAssets();

  prices.forEach((pair) => {
    const baseCode = pair.currencyPair.split("/")[0];
    const asset = assets.find(a => a.code.toUpperCase() === baseCode.toUpperCase());
    const isCrypto = asset ? asset.type === "crypto" : (pair.currencyPair.startsWith("BTC") || pair.currencyPair.startsWith("ETH") || pair.currencyPair.startsWith("SOL"));
    const volatility = isCrypto ? 0.0015 : 0.0003;
    
    const direction = Math.random() > 0.48 ? 1 : -1; // slight upward drift
    const changePercent = Math.random() * volatility;
    
    const newRate = pair.rate * (1 + direction * changePercent);
    dbStore.updatePrice(pair.currencyPair, Number(newRate.toFixed(isCrypto ? 2 : 4)));
  });

  // Call broadcast callback if registered
  if (broadcastCallback) {
    broadcastCallback(dbStore.getPrices());
  }
}

// Start price service loop (every 2 seconds)
export function startPriceService() {
  if (intervalId) return;

  console.log("Starting Real-time Price Service...");
  // Initial sync with real prices immediately on server start!
  fetchRealPrices().catch((err) => console.error("Initial real-world price fetch failed:", err));

  intervalId = setInterval(() => {
    simulatePriceTick();
  }, 2000);
}

// Fetch live real-time market prices from external feeds
export async function fetchRealPrices(): Promise<void> {
  try {
    console.log("Fetching live real-time market price rates...");
    
    // Fetch crypto prices from CryptoCompare
    const cryptoRes = await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SOL,USDT&tsyms=USD");
    const cryptoData = (await cryptoRes.json()) as any;

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

    // Fetch fiat conversion rates using Frankfurter API
    const fiatRes = await fetch("https://api.frankfurter.app/latest?from=USD&symbols=EUR,GBP");
    const fiatData = (await fiatRes.json()) as any;

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
    // If external APIs fail or are throttled, run a simulation tick as a graceful fallback
    simulatePriceTick();
  }

  // Broadcast the updated prices
  if (broadcastCallback) {
    broadcastCallback(dbStore.getPrices());
  }
}

// Force manually triggered sync by administrator
export async function forcePriceSync() {
  console.log("Admin triggering manual price synchronisation!");
  await fetchRealPrices();
  return dbStore.getPrices();
}
