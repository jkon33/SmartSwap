import { useEffect, useRef, useState } from "react";
import { useRealtimePrices } from "../hooks/useRealtimePrices";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";

interface PriceTrend {
  [key: string]: "up" | "down" | "flat";
}

export default function PriceTicker() {
  const { prices, connected } = useRealtimePrices();
  const [trends, setTrends] = useState<PriceTrend>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (prices.length > 0) {
      const newTrends: PriceTrend = {};
      prices.forEach((p) => {
        const prevRate = prevPricesRef.current[p.currencyPair];
        if (prevRate !== undefined) {
          if (p.rate > prevRate) {
            newTrends[p.currencyPair] = "up";
          } else if (p.rate < prevRate) {
            newTrends[p.currencyPair] = "down";
          } else {
            newTrends[p.currencyPair] = "flat";
          }
        } else {
          newTrends[p.currencyPair] = "flat";
        }
        // Save current rate
        prevPricesRef.current[p.currencyPair] = p.rate;
      });

      setTrends(newTrends);

      // Reset trends to flat after 800ms to clear flash state
      const timer = setTimeout(() => {
        const clearedTrends: PriceTrend = {};
        prices.forEach((p) => {
          clearedTrends[p.currencyPair] = "flat";
        });
        setTrends(clearedTrends);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [prices]);

  const displayPairs = [
    { key: "BTC/USD", label: "BTC/USD", isCrypto: true },
    { key: "ETH/USD", label: "ETH/USD", isCrypto: true },
    { key: "SOL/USD", label: "SOL/USD", isCrypto: true },
    { key: "USDT/USD", label: "USDT/USD", isCrypto: true },
    { key: "USD/EUR", label: "USD/EUR", isCrypto: false },
    { key: "USD/GBP", label: "USD/GBP", isCrypto: false },
  ];

  return (
    <div className="w-full bg-slate-900 text-white py-2.5 px-4 shadow-sm select-none">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Connection status indicator */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1">
            <span className={`relative flex h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-rose-500"}`}>
              {connected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>}
            </span>
            <span className="font-mono text-[10px] tracking-wider font-semibold uppercase text-slate-400">
              {connected ? "LIVE RATETICKER" : "CONNECTING..."}
            </span>
          </div>
          {connected ? <Wifi className="h-3.5 w-3.5 text-emerald-400" /> : <WifiOff className="h-3.5 w-3.5 text-rose-400" />}
        </div>

        {/* Running ticker bar */}
        <div className="flex flex-1 items-center justify-start lg:justify-center overflow-x-auto whitespace-nowrap scrollbar-none gap-6 px-2">
          {displayPairs.map((pair) => {
            const currentPriceObj = prices.find((p) => p.currencyPair === pair.key);
            const rate = currentPriceObj ? currentPriceObj.rate : null;
            const trend = trends[pair.key] || "flat";

            let flashClass = "text-slate-300";
            if (trend === "up") flashClass = "text-emerald-400 scale-105 transition-all duration-150";
            if (trend === "down") flashClass = "text-rose-400 scale-105 transition-all duration-150";

            return (
              <div key={pair.key} className="flex items-center space-x-2 shrink-0">
                <span className="font-sans font-semibold text-slate-400">{pair.label}</span>
                <span className={`font-mono font-bold ${flashClass}`}>
                  {rate !== null
                    ? pair.isCrypto
                      ? `$${rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : rate.toFixed(4)
                    : "Fetching..."}
                </span>

                {/* Trend tiny icons */}
                {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />}
                {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-rose-400 animate-bounce" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
