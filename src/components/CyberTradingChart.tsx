import { useState, useMemo, useRef, useEffect, TouchEvent } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CyberTradingChartProps {
  pair?: string;
  currentPrice?: number;
}

export default function CyberTradingChart({
  pair = "BTC/USD",
  currentPrice = 77480,
}: CyberTradingChartProps) {
  const [chartType, setChartType] = useState<"candle" | "area">("candle");
  const [timeframe, setTimeframe] = useState<"1H" | "24H" | "7D" | "30D">("24H");
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 320 });

  // Responsive container observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          const w = entry.contentRect.width;
          const h = w < 480 ? 240 : w < 768 ? 280 : 320;
          setDimensions({
            width: Math.max(280, w),
            height: h,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate realistic deterministic candlestick series around currentPrice
  const candles: CandleData[] = useMemo(() => {
    const count = timeframe === "1H" ? 24 : timeframe === "24H" ? 32 : timeframe === "7D" ? 28 : 30;
    const data: CandleData[] = [];
    const base = currentPrice || 77000;
    let price = base * 0.96;

    const now = Date.now();
    const interval = timeframe === "1H" ? 60000 * 2.5 : timeframe === "24H" ? 3600000 * 0.75 : 86400000 * 0.25;

    // Seeded random walk
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const seed = Math.sin(i * 1.7) * 0.6 + Math.cos(i * 0.9) * 0.4;
      const changePercent = (seed * 0.02) + (i / count) * 0.04;
      const open = price;
      let close = isLast ? currentPrice : open * (1 + changePercent * (Math.sin(i) > 0 ? 1 : -0.85));
      const high = Math.max(open, close) * (1 + Math.abs(Math.cos(i * 2.1)) * 0.012);
      const low = Math.min(open, close) * (1 - Math.abs(Math.sin(i * 1.5)) * 0.012);
      const volume = Math.round(15 + Math.abs(Math.sin(i * 3)) * 85);

      const timestamp = new Date(now - (count - 1 - i) * interval);
      const timeStr = timeframe === "1H" || timeframe === "24H" 
        ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : timestamp.toLocaleDateString([], { month: "short", day: "numeric" });

      data.push({ time: timeStr, open, high, low, close, volume });
      price = close;
    }
    return data;
  }, [pair, currentPrice, timeframe]);

  // Compute scale boundaries
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });
    const padding = (max - min) * 0.1 || 10;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: (max + padding) - (min - padding) || 1,
    };
  }, [candles]);

  const activeCandle = hoveredCandle || candles[candles.length - 1];
  const isOverallBullish = activeCandle && activeCandle.close >= activeCandle.open;

  // Coordinate transforms
  const chartHeight = dimensions.height - 45;
  const isSmallScreen = dimensions.width < 500;
  const rightMargin = isSmallScreen ? 55 : 70;
  const chartWidth = Math.max(200, dimensions.width - rightMargin);
  const candleSlotWidth = chartWidth / (candles.length || 1);
  const candleBodyWidth = Math.max(2, candleSlotWidth * 0.65);

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  // Build SVG path for Area Chart
  const areaPath = useMemo(() => {
    if (candles.length === 0) return "";
    let points = "";
    candles.forEach((c, idx) => {
      const x = idx * candleSlotWidth + candleSlotWidth / 2;
      const y = getY(c.close);
      points += `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
    });
    return points;
  }, [candles, candleSlotWidth, minPrice, priceRange, chartHeight]);

  const filledAreaPath = useMemo(() => {
    if (!areaPath) return "";
    const lastX = (candles.length - 1) * candleSlotWidth + candleSlotWidth / 2;
    const firstX = candleSlotWidth / 2;
    return `${areaPath} L ${lastX.toFixed(1)} ${chartHeight} L ${firstX.toFixed(1)} ${chartHeight} Z`;
  }, [areaPath, candles, candleSlotWidth, chartHeight]);

  // Touch tracking for mobile / tablet
  const handleTouchMove = (e: TouchEvent<SVGSVGElement>) => {
    if (!containerRef.current || candles.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const idx = Math.floor(touchX / candleSlotWidth);
    if (idx >= 0 && idx < candles.length) {
      setHoveredCandle(candles[idx]);
    }
  };

  return (
    <div className="cyber-card rounded-2xl p-4 sm:p-5 relative overflow-hidden border border-cyan-400/30">
      {/* L-shaped corner cyber brackets */}
      <span className="corner-bracket-tl" />
      <span className="corner-bracket-tr" />
      <span className="corner-bracket-bl" />
      <span className="corner-bracket-br" />

      {/* Header bar with controls */}
      <div className="flex flex-col gap-3 pb-3 sm:pb-4 border-b border-cyan-500/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-400 shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-orbitron font-black text-base sm:text-lg tracking-wider text-white">
                  {pair}
                </h3>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/40">
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 font-mono text-xs">
                <span className="text-white font-bold text-xs sm:text-sm">
                  ${(currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`flex items-center text-[10px] sm:text-[11px] font-bold ${isOverallBullish ? "text-[#39FF14] glow-text-green" : "text-[#FF0055]"}`}>
                  {isOverallBullish ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {isOverallBullish ? "+2.48%" : "-1.12%"}
                </span>
              </div>
            </div>
          </div>

          {/* Switchers (Compact & Responsive) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Chart Type Toggle */}
            <div className="flex items-center rounded-lg bg-[#05060A] p-0.5 sm:p-1 border border-cyan-500/25">
              <button
                onClick={() => setChartType("candle")}
                className={`px-2 py-1 text-[11px] sm:text-xs font-mono font-bold rounded transition-all ${
                  chartType === "candle"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`px-2 py-1 text-[11px] sm:text-xs font-mono font-bold rounded transition-all ${
                  chartType === "area"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Area
              </button>
            </div>

            {/* Timeframe Toggle */}
            <div className="flex items-center rounded-lg bg-[#05060A] p-0.5 sm:p-1 border border-cyan-500/25 text-[11px] sm:text-xs font-mono">
              {(["1H", "24H", "7D", "30D"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold rounded transition-all ${
                    timeframe === tf
                      ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400 shadow-[0_0_8px_rgba(255,0,229,0.4)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OHLC readout (Responsive flex) */}
        {activeCandle && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#05060A]/80 border border-cyan-500/20 text-slate-300 overflow-x-auto">
            <div><span className="text-slate-500">O:</span> ${(activeCandle.open).toFixed(2)}</div>
            <div><span className="text-slate-500">H:</span> <span className="text-[#39FF14]">${(activeCandle.high).toFixed(2)}</span></div>
            <div><span className="text-slate-500">L:</span> <span className="text-[#FF0055]">${(activeCandle.low).toFixed(2)}</span></div>
            <div><span className="text-slate-500">C:</span> <span className="text-cyan-400 font-bold">${(activeCandle.close).toFixed(2)}</span></div>
            <div className="hidden sm:inline"><span className="text-slate-500">VOL:</span> {activeCandle.volume}k</div>
          </div>
        )}
      </div>

      {/* SVG Canvas Area */}
      <div ref={containerRef} className="relative w-full pt-2 sm:pt-4 cursor-crosshair overflow-hidden">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          className="overflow-visible select-none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#8A2BE2" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#05060A" stopOpacity="0" />
            </linearGradient>

            {/* Neon line filter */}
            <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight * pct;
            const price = maxPrice - (maxPrice - minPrice) * pct;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="rgba(0, 240, 255, 0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth + 6}
                  y={y + 4}
                  fill="#64748B"
                  fontSize={isSmallScreen ? "8" : "10"}
                  fontFamily="JetBrains Mono, monospace"
                >
                  ${price.toFixed(price > 100 ? 0 : 2)}
                </text>
              </g>
            );
          })}

          {/* Current Live Price Dashed Line */}
          {currentPrice && (
            <g>
              <line
                x1="0"
                y1={getY(currentPrice)}
                x2={chartWidth}
                y2={getY(currentPrice)}
                stroke="#00F0FF"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.85"
                filter="url(#neonGlowCyan)"
              />
              <rect
                x={chartWidth + 2}
                y={getY(currentPrice) - 8}
                width={Math.max(45, dimensions.width - chartWidth - 4)}
                height={16}
                rx={3}
                fill="#00F0FF"
              />
              <text
                x={chartWidth + 5}
                y={getY(currentPrice) + 4}
                fill="#05060A"
                fontSize={isSmallScreen ? "8" : "9"}
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
              >
                ${currentPrice.toFixed(0)}
              </text>
            </g>
          )}

          {/* Candlestick Rendering */}
          {chartType === "candle" && (
            <g>
              {candles.map((c, idx) => {
                const xCenter = idx * candleSlotWidth + candleSlotWidth / 2;
                const isBull = c.close >= c.open;
                const strokeColor = isBull ? "#39FF14" : "#FF0055";
                const fillColor = isBull ? "#39FF14" : "#FF0055";
                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredCandle(c)}
                    onMouseLeave={() => setHoveredCandle(null)}
                    className="cursor-pointer transition-opacity duration-150 hover:opacity-100"
                  >
                    {/* Wick */}
                    <line
                      x1={xCenter}
                      y1={yHigh}
                      x2={xCenter}
                      y2={yLow}
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      opacity="0.8"
                    />

                    {/* Candle Body with glow filter */}
                    <rect
                      x={xCenter - candleBodyWidth / 2}
                      y={bodyTop}
                      width={candleBodyWidth}
                      height={bodyHeight}
                      rx={1}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="0.8"
                      style={{
                        filter: isBull
                          ? "drop-shadow(0 0 3px rgba(57, 255, 20, 0.6))"
                          : "drop-shadow(0 0 3px rgba(255, 0, 85, 0.6))",
                      }}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Area / Line Rendering */}
          {chartType === "area" && (
            <g>
              <path d={filledAreaPath} fill="url(#cyberAreaGrad)" />
              <path
                d={areaPath}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2"
                filter="url(#neonGlowCyan)"
              />
              {/* Pulsing head node on latest price point */}
              {candles.length > 0 && (
                <circle
                  cx={(candles.length - 1) * candleSlotWidth + candleSlotWidth / 2}
                  cy={getY(candles[candles.length - 1].close)}
                  r="4"
                  fill="#00F0FF"
                  filter="url(#neonGlowCyan)"
                  className="animate-ping"
                />
              )}
            </g>
          )}

          {/* Time axis labels */}
          {candles.map((c, idx) => {
            const step = isSmallScreen ? Math.ceil(candles.length / 4) : Math.ceil(candles.length / 6);
            if (idx % step === 0) {
              const x = idx * candleSlotWidth + candleSlotWidth / 2;
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize={isSmallScreen ? "8" : "10"}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {c.time}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Cyber status footer note */}
      <div className="mt-2 sm:mt-3 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-cyan-400/70 pt-2 border-t border-cyan-500/10">
        <span className="flex items-center gap-1.5 truncate">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00F0FF]"></span>
          </span>
          <span className="truncate">ORACLE WEBSOCKET FEED (2000MS)</span>
        </span>
        <span className="hidden sm:inline text-slate-500 shrink-0">DEFI SLIPPAGE: 0%</span>
      </div>
    </div>
  );
}
