import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useRealtimePrices } from "../hooks/useRealtimePrices";
import { api } from "../services/api";
import { ArrowUpDown, Info, CheckCircle2, AlertCircle, Sparkles, Building2, Wallet } from "lucide-react";
import toast from "react-hot-toast";

export default function SwapCard({ onSuccess }: { onSuccess?: () => void }) {
  const { user, refreshMe } = useAuth();
  const { calculateRate } = useRealtimePrices();

  // Currencies list state with defaults as fallbacks
  const [cryptoList, setCryptoList] = useState<string[]>(["BTC", "ETH", "USDT", "SOL"]);
  const [fiatList, setFiatList] = useState<string[]>(["USD", "EUR", "GBP"]);
  const [allCurrencies, setAllCurrencies] = useState<string[]>(["BTC", "ETH", "USDT", "SOL", "USD", "EUR", "GBP"]);

  // State
  const [fromCur, setFromCur] = useState("USDT");
  const [toCur, setToCur] = useState("BTC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [rate, setRate] = useState(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [selectedPayoutId, setSelectedPayoutId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  
  // Confirmed Tx receipt overlay state
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  // Load swappable active assets dynamically
  useEffect(() => {
    const loadAssetsList = async () => {
      try {
        const assets = await api.assets.list();
        const activeAssets = assets.filter((a: any) => a.isActive);
        const cryptos = activeAssets.filter((a: any) => a.type === "crypto").map((a: any) => a.code);
        const fiats = activeAssets.filter((a: any) => a.type === "fiat").map((a: any) => a.code);
        setCryptoList(cryptos);
        setFiatList(fiats);
        setAllCurrencies(activeAssets.map((a: any) => a.code));
      } catch (err) {
        console.error("Error loading swappable currencies:", err);
      }
    };
    loadAssetsList();
  }, []);

  // Calculate live conversion whenever currency selectors or fromAmount changes
  useEffect(() => {
    const currentRate = calculateRate(fromCur, toCur);
    setRate(currentRate);

    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const result = parseFloat(fromAmount) * currentRate;
      setToAmount(result.toFixed(fromCur === "BTC" || toCur === "BTC" ? 6 : 4));
    } else {
      setToAmount("");
    }
  }, [fromCur, toCur, fromAmount, calculateRate]);

  // Load user's withdrawal destinations matching toCur
  useEffect(() => {
    if (!user) return;

    const fetchPayouts = async () => {
      setLoadingPayouts(true);
      try {
        const data = await api.user.getWithdrawalMethods();
        const wallets = data.cryptoWallets || [];
        const bankAccounts = data.bankAccounts || [];

        // Filter payouts that match our chosen target currency
        let matched: any[] = [];
        const isTargetFiat = fiatList.includes(toCur);

        if (isTargetFiat) {
          // Fiat gets bank accounts
          matched = bankAccounts.map((b: any) => ({
            id: b.id,
            type: "bank",
            label: `${b.label} (${b.bankName} - ...${b.accountNumber.slice(-4)})`,
            currency: toCur,
          }));
        } else {
          // Crypto gets wallets matching toCur
          matched = wallets
            .filter((w: any) => w.currency === toCur)
            .map((w: any) => ({
              id: w.id,
              type: "crypto",
              label: `${w.label} - ${w.address.slice(0, 6)}...${w.address.slice(-4)}`,
              currency: toCur,
            }));
        }

        setPayouts(matched);
        if (matched.length > 0) {
          setSelectedPayoutId(matched[0].id);
        } else {
          setSelectedPayoutId("");
        }
      } catch (err) {
        console.error("Failed to load user payout destinations:", err);
      } finally {
        setLoadingPayouts(false);
      }
    };

    fetchPayouts();
  }, [toCur, user]);

  const handleSwapCurrencies = () => {
    const temp = fromCur;
    setFromCur(toCur);
    setToCur(temp);
  };

  const currentFromBalance = user?.balances?.[fromCur] || 0;
  const insifficientBalance = currentFromBalance < parseFloat(fromAmount || "0");

  const handleSubmitSwap = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to initiate swaps.");
      return;
    }

    if (fromCur === toCur) {
      toast.error("Cannot swap between identical currencies.");
      return;
    }

    const amt = parseFloat(fromAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    if (insifficientBalance) {
      toast.error(`Sufficient simulated ${fromCur} balance is not available.`);
      return;
    }

    if (!selectedPayoutId) {
      toast.error(`Please configure and select a payout destination for ${toCur} first.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const tx = await api.swap.createSwap(fromCur, toCur, amt, selectedPayoutId);
      toast.success("Swap order initiated successfully!");
      setActiveReceipt(tx);
      setFromAmount("");
      await refreshMe();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate swap.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* SUCCESS OVERLAY RECEIPT */}
      {activeReceipt && (
        <div className="rounded-2xl border border-emerald-150 bg-emerald-50/40 p-6 md:p-8 text-slate-800 shadow-lg animate-fade-in mb-6">
          <div className="flex items-center space-x-3 text-emerald-600 mb-4">
            <CheckCircle2 className="h-8 w-8 shrink-0 animate-bounce" />
            <div>
              <h3 className="font-sans text-lg font-bold">Swap Initiated Safely!</h3>
              <p className="text-xs text-emerald-800 font-medium">Transaction: {activeReceipt.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 bg-white p-5 rounded-xl border border-gray-150/80 shadow-inner">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">Send deposit of</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {activeReceipt.fromAmount} {activeReceipt.fromCurrency}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">And receive swap payload</span>
              <span className="font-mono text-lg font-bold text-blue-600">
                {activeReceipt.toAmount} {activeReceipt.toCurrency}
              </span>
            </div>
            
            <div className="md:col-span-2 pt-3 border-t border-gray-100">
              <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider flex items-center space-x-1 mb-2">
                <Sparkles className="h-3.5 w-3.5 inline animate-pulse" />
                <span>Admin's Deposit Payout Destination (Deposit Here):</span>
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs divide-y divide-slate-100">
                <div className="pb-2 font-mono flex justify-between items-center">
                  <span className="text-gray-500">Method Type:</span>
                  <span className="font-semibold text-slate-900 uppercase">{activeReceipt.depositDetails?.type}</span>
                </div>
                <div className="pt-2 font-mono">
                  <span className="text-gray-500 block mb-1">Details/Address:</span>
                  <span className="font-bold text-slate-800 text-sm select-all break-all bg-amber-50/50 border border-amber-100 px-2 py-1 rounded w-full block">
                    {activeReceipt.depositDetails?.addressOrDetails}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5">Payout Wallet Target Account:</span>
              <span className="font-mono text-xs text-slate-700 bg-gray-50 p-2 rounded border border-gray-150 block truncate">
                {activeReceipt.withdrawDetails?.label}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 rounded-lg bg-blue-50 border border-blue-150 p-3.5 text-xs text-blue-800 leading-relaxed mb-6">
            <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Wait for validation:</strong> This manual transfer has been cataloged as <span className="underline font-semibold">Pending</span>. The administrator will inspect your transfer. Once confirmed, your simulated balances sheet will reflect changes instantly.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setActiveReceipt(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition shadow"
            >
              Order Another Swap
            </button>
          </div>
        </div>
      )}

      {/* PRIMARY SWAPPING CARD FORM */}
      {!activeReceipt && (
        <form onSubmit={handleSubmitSwap} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md shadow-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sans text-lg font-bold tracking-tight text-gray-900 flex items-center space-x-2">
              <span>Execute Real-time Swap</span>
            </h3>
            <span className="flex items-center space-x-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
              <Sparkles className="h-3 w-3 inline text-blue-600 animate-pulse" />
              <span>Zero Slippage Enabled</span>
            </span>
          </div>

          {/* SEND CURRENCY BOX */}
          <div className="rounded-xl border border-gray-150 bg-gray-50/40 p-4 mb-3 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5Packed">
              <span>Sell Asset / Deposit</span>
              <span className="font-mono text-gray-500">
                Available: {currentFromBalance.toFixed(fiatList.includes(fromCur) ? 2 : 4)} {fromCur}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full flex-1 bg-transparent font-mono text-2xl font-bold text-gray-900 focus:outline-none placeholder-gray-300"
                disabled={isSubmitting}
                required
              />
              <select
                value={fromCur}
                onChange={(e) => setFromCur(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 shadow-sm focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
              >
                {allCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INTERCHANGE BUTTON */}
          <div className="flex justify-center -my-1.5 relative z-10">
            <button
              type="button"
              onClick={handleSwapCurrencies}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md hover:scale-105 transition active:scale-95"
              title="Reverse Swap Direction"
              disabled={isSubmitting}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* RECEIVE CURRENCY BOX */}
          <div className="rounded-xl border border-gray-150 bg-gray-50/40 p-4 mb-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
              <span>Buy Asset / Payout Receipt</span>
              <span className="font-mono text-gray-400">
                Balance: {user?.balances?.[toCur]?.toFixed(fiatList.includes(toCur) ? 2 : 4) || "0.00"} {toCur}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="w-full flex-1 bg-transparent font-mono text-2xl font-bold text-gray-800 focus:outline-none"
              />
              <select
                value={toCur}
                onChange={(e) => setToCur(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 shadow-sm focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
              >
                {allCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SELECT WITHDRAW PAYOUT PROFILE */}
          <div className="mb-5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
              Payout Payout Destination ({toCur})
            </label>
            {loadingPayouts ? (
              <div className="h-10 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center font-mono">
                Syncing payouts profile...
              </div>
            ) : payouts.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedPayoutId}
                  onChange={(e) => setSelectedPayoutId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-800 focus:border-blue-500 focus:outline-none shadow-sm"
                  disabled={isSubmitting}
                  required
                >
                  {payouts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3.5 border border-amber-150 bg-amber-50/40 rounded-xl text-xs text-amber-800 flex items-start space-x-2 select-none">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold mb-0.5">Missing Payout Profile!</p>
                  <p className="leading-relaxed mb-2">
                    You have not registered any crypto wallet address or bank account configured for payouts in <strong>{toCur}</strong>.
                  </p>
                  <a
                    href="/profile"
                    className="inline-flex items-center space-x-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    <span>Click here to register a profile now &rarr;</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* QUOTE STABILITY RATES BLOCK */}
          {rate > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3 mb-6 font-mono text-xs">
              <span className="text-gray-500">Execution Reference:</span>
              <span className="text-slate-900 font-bold">
                1 {fromCur} = {rate < 0.001 ? rate.toFixed(8) : rate.toFixed(5)} {toCur}
              </span>
            </div>
          )}

          {/* INSUFFICIENT MOCK BALANCES ALERT */}
          {fromAmount && insifficientBalance && (
            <div className="mb-5 flex items-start space-x-2 rounded-xl bg-red-50 border border-red-150 p-3.5 text-xs text-red-800">
              <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Sufficient Simulated Balance is Unreached</span>
                <span>
                  Your profile has <strong>{currentFromBalance.toFixed(4)} {fromCur}</strong>, but your purchase requests <strong>{parseFloat(fromAmount).toFixed(4)}</strong>. You can configure bank settings or swap lower limits.
                </span>
              </div>
            </div>
          )}

          {/* SUBMISSION BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || insifficientBalance || !selectedPayoutId || !fromAmount}
            className={`w-full py-3.5 rounded-xl text-center text-sm font-bold tracking-wide transition shadow-md ${
              isSubmitting || insifficientBalance || !selectedPayoutId || !fromAmount
                ? "bg-gray-150 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-100"
            }`}
          >
            {isSubmitting ? "Locking rates & dispatching..." : "Submit Swap Order"}
          </button>
        </form>
      )}
    </div>
  );
}
