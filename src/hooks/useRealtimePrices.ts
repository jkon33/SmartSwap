import { useSocketPrices } from "../context/SocketContext";

export function useRealtimePrices() {
  const { prices, connected } = useSocketPrices();

  // Convert fromCurrency -> USD -> toCurrency (matching backend calculation exactly)
  const calculateRate = (fromCur: string, toCur: string): number => {
    if (fromCur === toCur) return 1.0;

    // Helper to get rate in USD (i.e., how many USD is 1 unit of this currency)
    const getUSDValue = (currency: string): number => {
      const curUpper = currency.toUpperCase();
      if (curUpper === "USD") return 1.0;

      // 1. Check for direct pair (e.g. BTC/USD)
      const directPair = prices.find((p) => p.currencyPair === `${curUpper}/USD`);
      if (directPair) {
        return directPair.rate;
      }

      // 2. Check for inverse pair (e.g. USD/EUR)
      const inversePair = prices.find((p) => p.currencyPair === `USD/${curUpper}`);
      if (inversePair && inversePair.rate > 0) {
        return 1.0 / inversePair.rate;
      }
      
      // 3. Resilient default fallbacks
      if (curUpper === "BTC") return 68450;
      if (curUpper === "ETH") return 3450;
      if (curUpper === "SOL") return 168.5;
      if (curUpper === "USDT") return 1.0;
      if (curUpper === "EUR") return 1.087;
      if (curUpper === "GBP") return 1.266;
      
      return 1.0;
    };

    const fromInUSD = getUSDValue(fromCur);

    // Convert USD amount back to toCur
    const usdToCurrencyRate = (currency: string): number => {
      const curUpper = currency.toUpperCase();
      if (curUpper === "USD") return 1.0;

      // 1. Check for direct pair
      const directPair = prices.find((p) => p.currencyPair === `${curUpper}/USD`);
      if (directPair && directPair.rate > 0) {
        return 1.0 / directPair.rate;
      }

      // 2. Check for inverse pair
      const inversePair = prices.find((p) => p.currencyPair === `USD/${curUpper}`);
      if (inversePair) {
        return inversePair.rate;
      }
      
      // 3. Resilient default fallbacks
      if (curUpper === "BTC") return 1.0 / 68450;
      if (curUpper === "ETH") return 1.0 / 3450;
      if (curUpper === "SOL") return 1.0 / 168.5;
      if (curUpper === "USDT") return 1.0;
      if (curUpper === "EUR") return 0.92;
      if (curUpper === "GBP") return 0.79;
      
      return 1.0;
    };

    const finalRate = fromInUSD * usdToCurrencyRate(toCur);
    return Number(finalRate.toFixed(8));
  };

  const getPairRateRaw = (pair: string): number => {
    return prices.find((p) => p.currencyPair === pair)?.rate || 0.0;
  };

  return {
    prices,
    connected,
    calculateRate,
    getPairRateRaw,
  };
}
