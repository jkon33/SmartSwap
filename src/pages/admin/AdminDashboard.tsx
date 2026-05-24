import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRealtimePrices } from "../../hooks/useRealtimePrices";
import { api } from "../../services/api";
import TransactionHistory from "../../components/TransactionHistory";
import {
  ShieldAlert,
  Users,
  Settings,
  Coins,
  ArrowRightLeft,
  RefreshCw,
  Plus,
  Lock,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  Building,
  Wallet,
  Compass,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { prices, calculateRate } = useRealtimePrices();

  // Tab state
  const [activeTab, setActiveTab] = useState<"transactions" | "traders" | "deposits" | "assets">("transactions");

  // Admin audit lists
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Syncing / Updating states
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [isUpdatingTx, setIsUpdatingTx] = useState<string | null>(null);

  // New Deposit Form
  const [depositType, setDepositType] = useState<"crypto" | "bank">("crypto");
  const [depositCurrency, setDepositCurrency] = useState("BTC");
  const [depositAddress, setDepositAddress] = useState("");
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // New Asset Form State
  const [assetCode, setAssetCode] = useState("");
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<"crypto" | "fiat">("crypto");
  const [assetRate, setAssetRate] = useState("");
  const [assetIconBg, setAssetIconBg] = useState("");
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  const loadAdminMetrics = async () => {
    setLoading(true);
    try {
      const usersData = await api.admin.getAllUsers();
      const txData = await api.admin.getAllTransactions();
      let assetsData: any[] = [];
      try {
        assetsData = await api.assets.list();
      } catch (assetErr) {
        console.error("Failed to load assets in admin dashboard:", assetErr);
      }
      setAllUsers(usersData);
      setAllTransactions(txData);
      setAssets(assetsData);
    } catch (err) {
      console.error("Failed to load administrative logs:", err);
      toast.error("Failed to load administrative logs.");
    } finally {
      setLoading(false);
    }
  };

  // Submit new asset
  const handleAddAsset = async (e: FormEvent) => {
    e.preventDefault();
    if (!assetCode || !assetName || !assetRate) {
      toast.error("Please fill in all required asset fields.");
      return;
    }

    setIsSubmittingAsset(true);
    try {
      const parsedRate = parseFloat(assetRate);
      if (isNaN(parsedRate) || parsedRate <= 0) {
        toast.error("Rate must be a positive number.");
        return;
      }

      await api.admin.addAsset(
        assetCode.toUpperCase().trim(),
        assetName.trim(),
        assetType,
        parsedRate,
        assetIconBg.trim() || undefined
      );

      toast.success(`Asset ${assetCode.toUpperCase()} successfully added!`);
      
      // Reset form
      setAssetCode("");
      setAssetName("");
      setAssetRate("");
      setAssetIconBg("");
      
      // Reload lists
      await loadAdminMetrics();
    } catch (err: any) {
      toast.error(err.message || "Failed to add new asset.");
    } finally {
      setIsSubmittingAsset(false);
    }
  };

  // Toggle active status of asset
  const handleToggleAssetStatus = async (code: string, currentStatus: boolean) => {
    try {
      await api.admin.updateAsset(code, { isActive: !currentStatus });
      toast.success(`Asset ${code} marked ${!currentStatus ? "Active" : "Inactive"}!`);
      await loadAdminMetrics();
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset status.");
    }
  };

  // Edit rate of asset
  const handleUpdateAssetRate = async (code: string, newRateStr: string) => {
    const rateVal = parseFloat(newRateStr);
    if (isNaN(rateVal) || rateVal <= 0) {
      toast.error("Rate must be a valid positive number.");
      return;
    }

    try {
      await api.admin.updateAsset(code, { rateToUSD: rateVal });
      toast.success(`Rate for ${code} updated to $${rateVal}!`);
      await loadAdminMetrics();
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset rate.");
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAdminMetrics();
    }
  }, [user]);

  // Master rate sync triggers socket broadcast
  const handleSystemPriceSync = async () => {
    setIsSyncingPrices(true);
    try {
      await api.admin.syncPrices();
      toast.success("System price tiers broadcast to all terminals!");
    } catch (err) {
      toast.error("System price sync failed.");
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // Dispatch approval
  const handleUpdateStatus = async (txId: string, status: "completed" | "failed") => {
    setIsUpdatingTx(txId);
    try {
      await api.admin.updateTransactionStatus(txId, status);
      toast.success(`Transaction marked ${status} and balances clear!`);
      await loadAdminMetrics();
    } catch (err: any) {
      toast.error(err.message || "Approval execution failed.");
    } finally {
      setIsUpdatingTx(null);
    }
  };

  // Save deposit address
  const handleAddDepositDetail = async (e: FormEvent) => {
    e.preventDefault();
    if (!depositAddress) {
      toast.error("Please enter a valid wallet address or IBAN detail.");
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      await api.admin.addDepositDetail(depositType, depositCurrency, depositAddress);
      toast.success("Deposit depository configured successfully!");
      setDepositAddress("");
      await loadAdminMetrics();
    } catch (err: any) {
      toast.error(err.message || "Failed to add deposit detail.");
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Toggle deposit address active state
  const handleToggleDepositActive = async (id: string, currentActive: boolean) => {
    try {
      await api.admin.updateDepositDetailStatus(id, !currentActive);
      toast.success(`Deposit status adjusted to ${!currentActive ? "Active" : "Inactive"}`);
      await loadAdminMetrics();
    } catch (err) {
      toast.error("Failed to switch status.");
    }
  };

  // Calculate global totals
  const totalVolumeUSD = allTransactions
    .filter((tx) => tx.status === "completed")
    .reduce((val, tx) => val + tx.fromAmount * calculateRate(tx.fromCurrency, "USD"), 0);

  const pendingCount = allTransactions.filter((tx) => tx.status === "pending").length;

  // Filtered queries
  const filteredTraders = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTxs = allTransactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* 1. ADMIN BRAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-600">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">Root Authority Command</span>
          </div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight">SmartSwap Administration Board</h1>
          <p className="text-xs text-gray-500 font-medium">Audit registered portfolios, settle peer transactions, and synchronize global swap indexes.</p>
        </div>

        {/* Sync trigger button */}
        <button
          onClick={handleSystemPriceSync}
          disabled={isSyncingPrices}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md shadow-slate-200 uppercase tracking-wide cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncingPrices ? "animate-spin" : ""}`} />
          <span>Sync Prices Now</span>
        </button>
      </div>

      {/* 2. ADMIN BENTO STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl border border-gray-150 bg-white shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Pending Audit Swaps</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl font-extrabold text-amber-600">{pendingCount}</span>
            <span className="text-xs text-gray-400 font-medium">Needs Cleared</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-gray-150 bg-white shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Total Trading Volume (Completed)</span>
          <div className="flex items-baseline space-x-1">
            <span className="font-mono text-xl font-extrabold text-emerald-600">
              ${totalVolumeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">USD</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-gray-150 bg-white shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Registered Customers</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl font-extrabold text-slate-900">{allUsers.length}</span>
            <span className="text-xs text-gray-400 font-medium">Traders Active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-gray-150 bg-white shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Global System Logs</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl font-extrabold text-blue-600">{allTransactions.length}</span>
            <span className="text-xs text-gray-400 font-medium font-sans">Total actions</span>
          </div>
        </div>

      </div>

      {/* 3. TABS SELECTOR & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-2">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("transactions");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === "transactions" ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Settle Swaps ({pendingCount} pending)
          </button>
          
          <button
            onClick={() => {
              setActiveTab("traders");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === "traders" ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Audits & Balances
          </button>

          <button
            onClick={() => {
              setActiveTab("deposits");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === "deposits" ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Receipt Depositories
          </button>

          <button
            onClick={() => {
              setActiveTab("assets");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === "assets" ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Manage Assets
          </button>
        </div>

        {/* Search query box */}
        {activeTab !== "deposits" && activeTab !== "assets" && (
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder={activeTab === "traders" ? "Search trader email or name..." : "Search TxID or customer email..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 4. DYNAMIC SUB-VIEWS */}

      {/* TABS A: SETTLE SWAPS VIEW */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">Pending peer-payout confirmations</h3>
            <span className="text-[10px] font-bold text-gray-400 font-mono">Total {filteredTxs.length} records shown</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              {loading ? (
                <p className="p-8 text-center text-xs text-gray-400 font-mono">Auditing system ledgers...</p>
              ) : filteredTxs.length > 0 ? (
                <div className="divide-y divide-gray-150">
                  {filteredTxs.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-slate-50/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      
                      {/* Left Block: Account & amounts */}
                      <div className="space-y-1 my-0.5 min-w-[280px]">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 select-all">{tx.id}</span>
                          <span className="text-[10px] font-sans font-bold text-gray-500">{tx.userEmail}</span>
                        </div>
                        <p className="font-sans text-xs">
                          Swap Sent: <strong className="text-red-600 font-bold">{tx.fromAmount} {tx.fromCurrency}</strong> &rarr; Receive Payload: <strong className="text-emerald-600 font-bold">{tx.toAmount} {tx.toCurrency}</strong>
                        </p>
                        <div className="text-[10px] text-gray-400 font-mono">
                          Locked Rate: 1 {tx.fromCurrency} = {tx.rate} {tx.toCurrency} | {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Middle block: Depository configuration instructions used */}
                      <div className="p-2.5 rounded-lg border border-amber-100 bg-amber-50/30 font-mono text-[10px] text-amber-900 max-w-sm w-full">
                        <span className="font-bold text-amber-700 block mb-0.5">Payment Depository Target Configured:</span>
                        <p className="line-clamp-2 select-all">{tx.depositDetails?.addressOrDetails}</p>
                      </div>

                      {/* Right block: Action settles buttons */}
                      <div className="flex items-center space-x-2 w-full md:w-auto shrink-0 justify-end">
                        {tx.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(tx.id, "completed")}
                              disabled={isUpdatingTx !== null}
                              className="px-3.5 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Confirm Deposit Sent (Discharged)</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(tx.id, "failed")}
                              disabled={isUpdatingTx !== null}
                              className="px-3.5 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject Order</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold">
                            <span className="text-gray-405">Settlement:</span>
                            <span className={`uppercase font-extrabold ${tx.status === "completed" ? "text-emerald-600" : "text-rose-500"}`}>{tx.status}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12">
                  <p className="text-sm font-semibold text-gray-450">No transaction records match search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABS B: TRADERS REGISTRY VIEW */}
      {activeTab === "traders" && (
        <div className="space-y-4">
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">User accounts & simulated ledger heights</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <p className="col-span-2 text-center text-xs text-gray-400 font-mono">Fetching trader database...</p>
            ) : filteredTraders.length > 0 ? (
              filteredTraders.map((trader) => (
                <div key={trader.id} className="p-5 rounded-2xl border border-gray-150 bg-white hover:border-blue-200 transition space-y-3 shadow-inner">
                  
                  {/* Trader details header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-black text-sm text-slate-900">{trader.name}</h4>
                      <p className="text-[10px] text-gray-450 font-mono truncate max-w-[240px] block select-all">{trader.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-sans border ${
                      trader.role === "admin" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}>
                      {trader.role}
                    </span>
                  </div>

                  {/* Portfolio Audits */}
                  <div className="pt-2.5 border-t border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Portfolio Balances:</span>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                      {Object.entries(trader.balances || {}).map(([currency, num]: [string, any]) => (
                        <span key={currency} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-150 font-bold block">
                          {currency}: <strong className="text-slate-900">{num.toFixed(currency === "BTC" || currency === "ETH" ? 4 : 1)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Registered payouts method counts */}
                  <div className="pt-2 flex space-x-4 text-[10px] font-semibold text-gray-500 font-sans leading-relaxed">
                    <p>Wallets setup: <strong className="text-slate-900">{(trader.cryptoWallets || []).length} registered</strong></p>
                    <p>Banks setup: <strong className="text-slate-900">{(trader.bankAccounts || []).length} registered</strong></p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-xs text-slate-400 p-8">No registered traders match query</p>
            )}
          </div>
        </div>
      )}

      {/* TABS C: ADMIN DEPOSIT SETUPS */}
      {activeTab === "deposits" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Configurator form left */}
          <div className="lg:col-span-4 rounded-2xl border border-gray-150 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">Configure deposit address</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans mt-0.5">Define target addresses or specific banking information where customers must dispatch swap amounts for clearance.</p>
            
            <form onSubmit={handleAddDepositDetail} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Method Class</label>
                <select
                  value={depositType}
                  onChange={(e) => {
                    const nextVal = e.target.value as "crypto" | "bank";
                    setDepositType(nextVal);
                    // Autofills target currency schemas
                    setDepositCurrency(nextVal === "crypto" ? "BTC" : "USD");
                  }}
                  className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="crypto">Cryptocurrency Address (crypto)</option>
                  <option value="bank">Banking Details (bank)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Incoming Asset</label>
                <select
                  value={depositCurrency}
                  onChange={(e) => setDepositCurrency(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                >
                  {depositType === "crypto" ? (
                    <>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                      <option value="SOL">SOL</option>
                    </>
                  ) : (
                    <>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Details / Address String</label>
                <textarea
                  required
                  rows={3}
                  placeholder={depositType === "crypto" ? "e.g., 0x98311a63cE9f291E33E..." : "e.g., Chase Bank, SmartSwap Corp, Acc: 1234..."}
                  value={depositAddress}
                  onChange={(e) => setDepositAddress(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingDeposit}
                className="w-full py-2.5 rounded-xl bg-slate-900 border text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                {isSubmittingDeposit ? "Locking keys..." : "Set Target Depository"}
              </button>
            </form>
          </div>

          {/* Table display list right */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">Current active customer depositories</h3>

            {loading ? (
              <p className="text-xs text-slate-400 font-mono">Loading lists...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allUsers.length > 0 && (dbStoreFallbackDetailList(allTransactions) || []).map((dep: any) => (
                  <div key={dep.id} className="p-4 rounded-xl border border-gray-150 bg-white space-y-2 font-mono text-xs flex justify-between items-start hover:border-blue-200 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5Packed">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border uppercase font-sans ${
                          dep.type === "crypto" ? "bg-amber-100 text-amber-805 border-amber-205" : "bg-emerald-100 text-emerald-805 border-emerald-205"
                        }`}>
                          {dep.currency}
                        </span>
                        <span className="font-sans font-bold text-slate-800 block text-xs capitalize ml-1.5">{dep.type} Method</span>
                      </div>
                      <p className="text-[10px] text-gray-550 break-all select-all pt-1 font-bold">
                        {dep.addressOrDetails}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Explicitly hardcode system seed references lists */}
                {apiDepositsStaticCard().map((sd) => (
                  <div key={sd.id} className="p-4 rounded-xl border border-gray-150 bg-white space-y-2 font-mono text-xs hover:border-blue-250 transition flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border uppercase font-sans ${
                          sd.type === "crypto" ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-blue-105 text-blue-800 border-blue-200"
                        }`}>
                          {sd.currency}
                        </span>
                        <span className="font-sans font-bold text-slate-800 block text-xs ml-1.5 capitalize">{sd.type} Channel</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold select-all pt-1">{sd.addressOrDetails}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-600 font-semibold italic flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                        <span>Settle Channel Online</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. MANAGE ASSETS TAB */}
      {activeTab === "assets" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* New Asset Creation Form */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-gray-150 bg-white shadow-sm space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <h2 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Coins className="h-4 w-4 text-slate-500" />
                <span>Register New Asset</span>
              </h2>
              <p className="text-[11px] text-gray-500">Provide token/code designations to add cryptos or fiat currencies to terminals.</p>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Currency Symbol/Code</label>
                <input
                  type="text"
                  placeholder="e.g. DOGE, CAD, BNB, JPY"
                  required
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Currency Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dogecoin, Canadian Dollar"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Asset Class Type</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as "crypto" | "fiat")}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="crypto">Cryptocurrency</option>
                  <option value="fiat">Fiat Currency</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Simulation Rate (to 1 USD)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 0.14 for Doge, 0.73 for CAD"
                  required
                  value={assetRate}
                  onChange={(e) => setAssetRate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Icon UI Styles (Optional Bg/Text CSS)</label>
                <input
                  type="text"
                  placeholder="e.g. bg-amber-100 text-amber-600 border-amber-200"
                  value={assetIconBg}
                  onChange={(e) => setAssetIconBg(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAsset}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition uppercase tracking-wider shadow cursor-pointer font-sans"
              >
                {isSubmittingAsset ? "Adding asset..." : "Register Global Asset"}
              </button>
            </form>
          </div>

          {/* Core Assets list and modification tool */}
          <div className="lg:col-span-8 space-y-4 text-xs font-sans">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">Supported System Currencies</h3>

            <div className="overflow-x-auto rounded-2xl border border-gray-150 bg-white">
              <table className="min-w-full divide-y divide-gray-155 text-xs text-left">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                  <tr>
                    <th className="px-5 py-3.5">Asset</th>
                    <th className="px-5 py-3.5">Class</th>
                    <th className="px-5 py-3.5">Simulated Spot Rate (USD)</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-medium text-slate-800">
                  {assets.map((a: any) => (
                    <tr key={a.code} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2.5">
                          <span className={`px-2 py-1 rounded-xl text-xs font-bold font-mono border ${a.iconBg || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                            {a.code}
                          </span>
                          <div>
                            <span className="font-sans font-bold text-gray-900 block">{a.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          a.type === "crypto" ? "bg-purple-100 text-purple-800 border-purple-150" : "bg-blue-100 text-blue-800 border-blue-150"
                        }`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold">
                        <div className="flex items-center space-x-1">
                          <span>$</span>
                          <input
                            type="number"
                            step="any"
                            defaultValue={a.rateToUSD}
                            onBlur={(e) => handleUpdateAssetRate(a.code, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateAssetRate(a.code, (e.target as any).value);
                                (e.target as any).blur();
                              }
                            }}
                            className="w-24 px-1.5 py-0.5 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none rounded bg-transparent focus:bg-white"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold ${
                          a.isActive ? "text-emerald-700" : "text-rose-600"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${a.isActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          <span>{a.isActive ? "Active Terminal" : "Suspended"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleToggleAssetStatus(a.code, a.isActive)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer font-sans ${
                            a.isActive
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100"
                          }`}
                        >
                          {a.isActive ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-400 font-sans">
                        No custom assets registered on node catalog.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Support items
function dbStoreFallbackDetailList(txs: any[]) {
  // Return any dynamically created depository items for display fallback
  const listMap = new Map();
  txs.forEach((tx) => {
    if (tx.depositDetails && tx.depositDetails.id) {
      listMap.set(tx.depositDetails.id, tx.depositDetails);
    }
  });
  return Array.from(listMap.values());
}

function apiDepositsStaticCard() {
  return [
    {
      id: "dep_btc",
      type: "crypto",
      currency: "BTC",
      addressOrDetails: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
    },
    {
      id: "dep_eth",
      type: "crypto",
      currency: "ETH",
      addressOrDetails: "0x98311a63cE9f291E33E1c27cEc47d8481A6b106D",
    },
    {
      id: "dep_usdt",
      type: "crypto",
      currency: "USDT",
      addressOrDetails: "0x98311a63cE9f291E33E1c27cEc47d8481A6b106D",
    },
    {
      id: "dep_sol",
      type: "crypto",
      currency: "SOL",
      addressOrDetails: "HN7cABFi4Y4GfNQQWfXcr377bQG6Xz6N3uY",
    },
    {
      id: "dep_usd",
      type: "bank",
      currency: "USD",
      addressOrDetails: "SmartSwap Corp, Bank of America, Acc: 9876543210, Routing: 021000021",
    },
    {
      id: "dep_eur",
      type: "bank",
      currency: "EUR",
      addressOrDetails: "SmartSwap GmbH, Deutsche Bank, IBAN: DE89370400440532013000, BIC: DEUTDEDDXXX",
    },
    {
      id: "dep_gbp",
      type: "bank",
      currency: "GBP",
      addressOrDetails: "SmartSwap Ltd, Barclays Bank, Sort Code: 20-00-00, Acc: 11223344",
    },
  ];
}
