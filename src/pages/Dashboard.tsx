import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRealtimePrices } from "../hooks/useRealtimePrices";
import { api } from "../services/api";
import TransactionHistory from "../components/TransactionHistory";
import {
  Wallet2,
  ArrowRightLeft,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Coins,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, refreshMe } = useAuth();
  const { calculateRate } = useRealtimePrices();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [reloading, setReloading] = useState(false);

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
      fetchTxHistory();
    }
  }, [user]);

  const handleManualBalanceRefresh = async () => {
    setReloading(true);
    try {
      await refreshMe();
      await fetchTxHistory();
      toast.success("Accounts refreshed of current states!");
    } catch (err) {
      toast.error("Reload sync failed.");
    } finally {
      setReloading(false);
    }
  };

  // Convert each asset balance to USD equivalent to compute aggregate net-worth
  const getSimulatedPortfolioValue = (): number => {
    if (!user || !user.balances) return 0.0;
    let totalUSD = 0;
    
    Object.entries(user.balances).forEach(([currency, amount]) => {
      // Find what 1 unit of this currency is worth in USD
      const unitValueInUSD = calculateRate(currency, "USD");
      totalUSD += (amount as number) * unitValueInUSD;
    });

    return totalUSD;
  };

  const roundedNetWorth = getSimulatedPortfolioValue();

  // List of active currencies styled card deck
  const assetsSchema = [
    { code: "BTC", name: "Bitcoin", iconBg: "bg-amber-100 text-amber-600 border-amber-200" },
    { code: "ETH", name: "Ethereum", iconBg: "bg-indigo-100 text-indigo-600 border-indigo-200" },
    { code: "SOL", name: "Solana", iconBg: "bg-purple-100 text-purple-600 border-purple-200" },
    { code: "USDT", name: "Tether USD", iconBg: "bg-teal-100 text-teal-600 border-teal-200" },
    { code: "USD", name: "US Dollar", iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200" },
    { code: "EUR", name: "Euro Coin", iconBg: "bg-blue-100 text-blue-600 border-blue-200" },
    { code: "GBP", name: "British Pound", iconBg: "bg-rose-100 text-rose-600 border-rose-200" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* 1. Header Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -transtlate-y-12 translate-x-12 h-44 w-44 rounded-full bg-blue-600/30 opacity-10 filter blur-3xl"></div>
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-blue-400">
              <Briefcase className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Active Simulated Net-Worth</span>
          </div>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight">
            ${roundedNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Accumulated asset values in real-time USD
          </p>
        </div>

        {/* Global navigation short buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleManualBalanceRefresh}
            disabled={reloading}
            className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center space-x-1.5 transition"
            title="Update simulated accounts with recent blockchain heights"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reloading ? "animate-spin" : ""}`} />
            <span>Update Balances</span>
          </button>
          
          <Link
            to="/swap"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Instant Swap Portal</span>
          </Link>
          
          <Link
            to="/profile"
            className="p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white transition"
            title="Setup payout methods details"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 2. Grid of Individual Holdings */}
      <div className="space-y-4">
        <h2 className="font-sans text-lg font-bold tracking-tight text-gray-900 flex items-center space-x-2">
          <Wallet2 className="h-5 w-5 text-gray-500" />
          <span>My Portfolio Holdings</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assetsSchema.map((asset) => {
            const rawBalance: number = (user?.balances?.[asset.code] as number) || 0.0;
            const usdValue = rawBalance * calculateRate(asset.code, "USD");

            return (
              <div key={asset.code} className="p-4 rounded-2xl border border-gray-150 bg-white hover:shadow-md transition duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl text-sm font-bold border ${asset.iconBg}`}>
                      {asset.code}
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-bold text-gray-900">{asset.name}</h3>
                      <span className="text-[10px] text-gray-400 font-mono tracking-wide">1 {asset.code} = ${calculateRate(asset.code, "USD").toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50">
                  <div className="font-mono text-lg font-bold text-slate-900">
                    {rawBalance.toLocaleString(undefined, { 
                      minimumFractionDigits: asset.code === "BTC" || asset.code === "ETH" ? 4 : 2, 
                      maximumFractionDigits: asset.code === "BTC" || asset.code === "ETH" ? 6 : 4 
                    })}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 font-sans mt-0.5">
                    &asymp; ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Customer swap activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold tracking-tight text-gray-900 flex items-center space-x-2">
            <Layers className="h-5 w-5 text-gray-500" />
            <span>My Recent Swaps</span>
          </h2>
          <span className="flex items-center space-x-1 border border-gray-200 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
            <Coins className="h-3.5 w-3.5 inline text-gray-400" />
            <span>{transactions.length} Total orders</span>
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
