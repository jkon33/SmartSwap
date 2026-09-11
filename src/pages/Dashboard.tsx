import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRealtimePrices } from "../hooks/useRealtimePrices";
import { api } from "../services/api";
import TransactionHistory from "../components/TransactionHistory";
import CyberTradingChart from "../components/CyberTradingChart";
import {
  Wallet2,
  ArrowRightLeft,
  Settings,
  Coins,
  Briefcase,
  Layers,
  RefreshCw,
  Activity,
  BarChart3,
  TrendingUp,
  Cpu,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, refreshMe } = useAuth();
  const { calculateRate, prices } = useRealtimePrices();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedChartPair, setSelectedChartPair] = useState<string>("BTC/USD");

  const fetchAssets = async () => {
    try {
      const data = await api.assets.list();
      setAssets(data.filter((a: any) => a.isActive));
    } catch (err) {
      console.error("Failed to load assets list:", err);
      setAssets([
        { code: "BTC", name: "Bitcoin", iconBorder: "border-amber-400/50 text-amber-400 bg-amber-950/40" },
        { code: "ETH", name: "Ethereum", iconBorder: "border-cyan-400/50 text-cyan-400 bg-cyan-950/40" },
        { code: "SOL", name: "Solana", iconBorder: "border-purple-400/50 text-purple-400 bg-purple-950/40" },
        { code: "USDT", name: "Tether USD", iconBorder: "border-emerald-400/50 text-emerald-400 bg-emerald-950/40" },
        { code: "USD", name: "US Dollar", iconBorder: "border-green-400/50 text-green-400 bg-green-950/40" },
        { code: "EUR", name: "Euro Coin", iconBorder: "border-blue-400/50 text-blue-400 bg-blue-950/40" },
        { code: "GBP", name: "British Pound", iconBorder: "border-rose-400/50 text-rose-400 bg-rose-950/40" },
      ]);
    }
  };

  const fetchTxHistory = async () => {
    try {
      const data = await api.swap.getHistory();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
      fetchTxHistory();
    }
  }, [user]);

  const handleManualBalanceRefresh = async () => {
    setReloading(true);
    try {
      await refreshMe();
      await fetchAssets();
      await fetchTxHistory();
      toast.success("Accounts refreshed with latest node blocks!");
    } catch (err) {
      toast.error("Node synchronization failed.");
    } finally {
      setReloading(false);
    }
  };

  const getSimulatedPortfolioValue = (): number => {
    if (!user || !user.balances) return 0.0;
    let totalUSD = 0;
    
    Object.entries(user.balances).forEach(([currency, amount]) => {
      const unitValueInUSD = calculateRate(currency, "USD");
      totalUSD += (amount as number) * unitValueInUSD;
    });

    return totalUSD;
  };

  const roundedNetWorth = getSimulatedPortfolioValue();

  const assetsSchema = assets.length > 0 ? assets : [
    { code: "BTC", name: "Bitcoin", iconBorder: "border-amber-400/50 text-amber-400 bg-amber-950/40" },
    { code: "ETH", name: "Ethereum", iconBorder: "border-cyan-400/50 text-cyan-400 bg-cyan-950/40" },
    { code: "SOL", name: "Solana", iconBorder: "border-purple-400/50 text-purple-400 bg-purple-950/40" },
    { code: "USDT", name: "Tether USD", iconBorder: "border-emerald-400/50 text-emerald-400 bg-emerald-950/40" },
    { code: "USD", name: "US Dollar", iconBorder: "border-green-400/50 text-green-400 bg-green-950/40" },
    { code: "EUR", name: "Euro Coin", iconBorder: "border-blue-400/50 text-blue-400 bg-blue-950/40" },
    { code: "GBP", name: "British Pound", iconBorder: "border-rose-400/50 text-rose-400 bg-rose-950/40" },
  ];

  const currentPairPrice = calculateRate(
    selectedChartPair.split("/")[0],
    selectedChartPair.split("/")[1]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in relative z-10">
      
      {/* 1. Futuristic Header Overview Banner with Corner Accents */}
      <div className="cyber-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <span className="corner-bracket-tl" />
        <span className="corner-bracket-tr" />
        <span className="corner-bracket-bl" />
        <span className="corner-bracket-br" />

        {/* Laser glow background element */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                <Briefcase className="h-4 w-4" />
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">
                ACTIVE SIMULATED NET-WORTH
              </span>
            </div>
            
            <h1 className="font-orbitron text-3xl sm:text-5xl font-black tracking-tight text-white glow-text-cyan">
              ${roundedNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            
            <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#39FF14] animate-ping" />
              REAL-TIME ORACLE LIQUIDITY AGGREGATION
            </p>
          </div>

          {/* Quick action triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualBalanceRefresh}
              disabled={reloading}
              className="px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-[#0A0E1A]/80 hover:bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center space-x-2 transition shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              title="Synchronize balances with blockchain oracle"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${reloading ? "animate-spin" : ""}`} />
              <span>{reloading ? "SYNCING..." : "SYNC BALANCES"}</span>
            </button>
            
            <Link
              to="/swap"
              className="btn-neon-cyan rounded-xl px-5 py-2.5 font-orbitron font-bold text-xs flex items-center space-x-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>SWAP TERMINAL</span>
            </Link>
            
            <Link
              to="/profile"
              className="p-2.5 rounded-xl border border-cyan-500/30 bg-[#0A0E1A]/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition"
              title="Payout Gateways & Address Configuration"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Cyber Candlestick & Live Trading Chart Panel */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_#00F0FF]" />
            <h2 className="font-orbitron text-lg font-black tracking-wide text-white">
              CYBER TRADING PANEL
            </h2>
          </div>

          {/* Pair selector pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A0E1A] border border-cyan-500/30">
            {["BTC/USD", "ETH/USD", "SOL/USD", "USDT/USD"].map((pair) => (
              <button
                key={pair}
                onClick={() => setSelectedChartPair(pair)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  selectedChartPair === pair
                    ? "bg-cyan-500/25 text-[#00F0FF] border border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {pair}
              </button>
            ))}
          </div>
        </div>

        <CyberTradingChart pair={selectedChartPair} currentPrice={currentPairPrice} />
      </div>

      {/* 3. List of Individual Holdings Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-orbitron text-lg font-black tracking-wide text-white flex items-center space-x-2">
            <Wallet2 className="h-5 w-5 text-cyan-400" />
            <span>PORTFOLIO ASSETS</span>
          </h2>
          <span className="font-mono text-xs text-cyan-400/80 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
            {assetsSchema.length} ACTIVE CURRENCIES
          </span>
        </div>
        
        <div className="cyber-card rounded-2xl overflow-hidden">
          <span className="corner-bracket-tl" />
          <span className="corner-bracket-tr" />
          <span className="corner-bracket-bl" />
          <span className="corner-bracket-br" />

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cyan-500/15">
              <thead className="bg-[#05060A]/80">
                <tr className="text-left text-xs font-orbitron font-bold text-cyan-300 uppercase tracking-wider">
                  <th scope="col" className="py-4 px-6">Asset Token</th>
                  <th scope="col" className="py-4 px-6 text-right">Oracle Rate (USD)</th>
                  <th scope="col" className="py-4 px-6 text-right">Vault Balance</th>
                  <th scope="col" className="py-4 px-6 text-right">USD Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 bg-transparent font-mono text-sm">
                {assetsSchema.map((asset, index) => {
                  const rawBalance: number = (user?.balances?.[asset.code] as number) || 0.0;
                  const currentRate = calculateRate(asset.code, "USD");
                  const usdValue = rawBalance * currentRate;

                  return (
                    <tr
                      key={asset.code}
                      className={`hover:bg-cyan-500/5 transition-colors ${
                        index % 2 === 0 ? "bg-[#0A0E1A]/40" : "bg-transparent"
                      }`}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-orbitron font-black text-xs shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.2)] ${asset.iconBorder || "border-cyan-400/40 text-cyan-300 bg-cyan-950/40"}`}>
                            {asset.code}
                          </div>
                          <div>
                            <p className="font-orbitron text-sm font-bold text-white">{asset.name}</p>
                            <p className="text-[10px] text-cyan-400/70 font-semibold tracking-wider font-mono uppercase">{asset.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap text-slate-300">
                        ${currentRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <p className="font-bold text-white">
                          {rawBalance.toLocaleString(undefined, { 
                            minimumFractionDigits: asset.code === "BTC" || asset.code === "ETH" ? 4 : 2, 
                            maximumFractionDigits: asset.code === "BTC" || asset.code === "ETH" ? 6 : 4 
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase mt-0.5">{asset.code}</p>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <p className="font-orbitron font-bold text-[#00F0FF] glow-text-cyan">
                          ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase">INDEX VALUE</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Customer recent swaps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-orbitron text-lg font-black tracking-wide text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            <span>TRANSACTION LEDGER</span>
          </h2>
          <span className="flex items-center space-x-1.5 border border-cyan-500/30 rounded-xl bg-cyan-950/30 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
            <Coins className="h-3.5 w-3.5 text-cyan-400" />
            <span>{transactions.length} Dispatched Orders</span>
          </span>
        </div>

        <TransactionHistory
          transactions={transactions}
          isLoading={loadingTx}
          onActionComplete={fetchTxHistory}
        />
      </div>

    </div>
  );
}
