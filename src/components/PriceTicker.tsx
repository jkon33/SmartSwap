import { useEffect, useRef, useState } from "react";
import { useRealtimePrices } from "../hooks/useRealtimePrices";
import { TrendingUp, TrendingDown, Wifi, WifiOff, Tv } from "lucide-react";

interface PriceTrend {
  [key: string]: "up" | "down" | "flat";
}

interface PriceTickerProps {
  scanlinesEnabled?: boolean;
  onToggleScanlines?: () => void;
}

export default function PriceTicker({
  scanlinesEnabled = false,
  onToggleScanlines,
}: PriceTickerProps) {
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
        prevPricesRef.current[p.currencyPair] = p.rate;
      });

      setTrends(newTrends);

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
    <div className="w-full bg-[#05060A]/95 backdrop-blur-md text-white py-1.5 sm:py-2 px-2 sm:px-4 border-b border-cyan-500/20 select-none relative z-30 shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Futuristic connection status indicator */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#0A0E1A] border border-cyan-500/30">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              {connected ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00F0FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#FF0055] shadow-[0_0_8px_#FF0055]"></span>
              )}
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-widest font-bold uppercase text-cyan-400">
              {connected ? "ORACLE" : "SYNCING"}
            </span>
          </div>
          {connected ? (
            <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#00F0FF] drop-shadow-[0_0_5px_#00F0FF]" />
          ) : (
            <WifiOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#FF0055]" />
          )}
        </div>

        {/* Running ticker bar with touch momentum scrolling */}
        <div className="flex flex-1 items-center justify-start lg:justify-center overflow-x-auto whitespace-nowrap scrollbar-none gap-4 sm:gap-6 px-1 sm:px-3 touch-pan-x">
          {displayPairs.map((pair) => {
            const currentPriceObj = prices.find((p) => p.currencyPair === pair.key);
            const rate = currentPriceObj ? currentPriceObj.rate : null;
            const trend = trends[pair.key] || "flat";

            let flashClass = "text-slate-300";
            if (trend === "up") flashClass = "text-[#39FF14] glow-text-green scale-105 transition-all duration-150";
            if (trend === "down") flashClass = "text-[#FF0055] text-shadow-[0_0_8px_#FF0055] scale-105 transition-all duration-150";

            return (
              <div key={pair.key} className="flex items-center space-x-1.5 shrink-0 group hover:opacity-100 transition-opacity">
                <span className="font-orbitron font-semibold text-[10px] sm:text-[11px] text-cyan-300/80 tracking-wide">
                  {pair.label}
                </span>
                <span className={`font-mono font-bold text-[11px] sm:text-xs ${flashClass}`}>
                  {rate !== null
                    ? pair.isCrypto
                      ? `$${rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : rate.toFixed(4)
                    : "···"}
                </span>

                {/* Trend tiny icons */}
                {trend === "up" && <TrendingUp className="h-3 w-3 text-[#39FF14] animate-bounce drop-shadow-[0_0_6px_#39FF14]" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-[#FF0055] animate-bounce drop-shadow-[0_0_6px_#FF0055]" />}
              </div>
            );
          })}
        </div>

        {/* CRT Scanline Toggle */}
        {onToggleScanlines && (
          <div className="shrink-0 flex items-center">
            <button
              onClick={onToggleScanlines}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all ${
                scanlinesEnabled
                  ? "bg-cyan-500/20 text-[#00F0FF] border border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                  : "bg-[#0A0E1A] text-slate-400 border border-slate-700 hover:text-cyan-300"
              }`}
              title="Toggle Cyberpunk CRT Scanline overlay effect"
            >
              <Tv className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">CRT {scanlinesEnabled ? "ON" : "OFF"}</span>
              <span className="sm:hidden">{scanlinesEnabled ? "CRT" : "OFF"}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
