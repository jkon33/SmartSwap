import { useSocketPrices } from "../context/SocketContext";

export function useRealtimePrices() {
  const { prices, connected } = useSocketPrices();

  // Convert fromCurrency -> USD -> toCurrency (matching backend calculation exactly)
  const calculateRate = (fromCur: string, toCur: string): number => {
    if (fromCur === toCur) return 1.0;

    // Helper to get rate in USD (i.e., how many USD is 1 unit of this currency)
    const getUSDValue = (currency: string): number => {
      if (currency === "USD") return 1.0;
      
      if (currency === "BTC") {
        return prices.find((p) => p.currencyPair === "BTC/USD")?.rate || 68450;
      }
      if (currency === "ETH") {
        return prices.find((p) => p.currencyPair === "ETH/USD")?.rate || 3450;
      }
      if (currency === "SOL") {
        return prices.find((p) => p.currencyPair === "SOL/USD")?.rate || 168.5;
      }
      if (currency === "USDT") {
        return prices.find((p) => p.currencyPair === "USDT/USD")?.rate || 1.0;
      }
      if (currency === "EUR") {
        const usdEur = prices.find((p) => p.currencyPair === "USD/EUR")?.rate || 0.92;
        return 1.0 / usdEur;
      }
      if (currency === "GBP") {
        const usdGbp = prices.find((p) => p.currencyPair === "USD/GBP")?.rate || 0.79;
        return 1.0 / usdGbp;
      }
      return 1.0;
    };

    const fromInUSD = getUSDValue(fromCur);

    // Convert USD amount back to toCur
    const usdToCurrencyRate = (currency: string): number => {
      if (currency === "USD") return 1.0;
      
      if (currency === "BTC") {
        const btcUsd = prices.find((p) => p.currencyPair === "BTC/USD")?.rate || 68450;
        return 1.0 / btcUsd;
      }
      if (currency === "ETH") {
        const ethUsd = prices.find((p) => p.currencyPair === "ETH/USD")?.rate || 3450;
        return 1.0 / ethUsd;
      }
      if (currency === "SOL") {
        const solUsd = prices.find((p) => p.currencyPair === "SOL/USD")?.rate || 168.5;
        return 1.0 / solUsd;
      }
      if (currency === "USDT") {
        const usdtUsd = prices.find((p) => p.currencyPair === "USDT/USD")?.rate || 1.0;
        return 1.0 / usdtUsd;
      }
      if (currency === "EUR") {
        return prices.find((p) => p.currencyPair === "USD/EUR")?.rate || 0.92;
      }
      if (currency === "GBP") {
        return prices.find((p) => p.currencyPair === "USD/GBP")?.rate || 0.79;
      }
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
