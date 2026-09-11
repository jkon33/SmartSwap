import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRealtimePrices } from "../hooks/useRealtimePrices";
import { api } from "../services/api";
import { ArrowUpDown, Info, CheckCircle2, AlertCircle, Sparkles, Zap, Lock, Copy } from "lucide-react";
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

        let matched: any[] = [];
        const isTargetFiat = fiatList.includes(toCur);

        if (isTargetFiat) {
          matched = bankAccounts.map((b: any) => ({
            id: b.id,
            type: "bank",
            label: `${b.label} (${b.bankName} - ...${b.accountNumber.slice(-4)})`,
            currency: toCur,
          }));
        } else {
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
        <div className="cyber-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden animate-fade-in mb-6 border border-[#39FF14]/50 shadow-[0_0_24px_rgba(57,255,20,0.3)]">
          <span className="corner-bracket-tl" style={{ borderColor: "#39FF14" }} />
          <span className="corner-bracket-tr" style={{ borderColor: "#39FF14" }} />
          <span className="corner-bracket-bl" style={{ borderColor: "#39FF14" }} />
          <span className="corner-bracket-br" style={{ borderColor: "#39FF14" }} />

          <div className="flex items-center space-x-3 text-[#39FF14] mb-4">
            <CheckCircle2 className="h-8 w-8 shrink-0 animate-bounce drop-shadow-[0_0_8px_#39FF14]" />
            <div>
              <h3 className="font-orbitron text-lg font-black tracking-wider glow-text-green">
                SWAP DISPATCHED SAFELY
              </h3>
              <p className="font-mono text-xs text-slate-400">TX REFERENCE: {activeReceipt.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 bg-[#05060A]/80 p-5 rounded-xl border border-cyan-500/25">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                DISPATCH DEPOSIT OF
              </span>
              <span className="font-mono text-xl font-black text-white">
                {activeReceipt.fromAmount} <span className="text-[#00F0FF]">{activeReceipt.fromCurrency}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                TARGET SETTLEMENT PAYLOAD
              </span>
              <span className="font-mono text-xl font-black text-[#39FF14] glow-text-green">
                {activeReceipt.toAmount} <span className="text-white">{activeReceipt.toCurrency}</span>
              </span>
            </div>
            
            <div className="md:col-span-2 pt-3 border-t border-cyan-500/20">
              <span className="text-[10px] font-mono font-bold uppercase text-[#FFB800] tracking-widest flex items-center space-x-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>ADMIN SECURE DEPOSIT VAULT:</span>
              </span>
              <div className="bg-[#0A0E1A] border border-cyan-500/30 rounded-lg p-3 text-xs space-y-2">
                <div className="font-mono flex justify-between items-center text-slate-300">
                  <span className="text-slate-500">Method Type:</span>
                  <span className="font-bold text-cyan-400 uppercase">{activeReceipt.depositDetails?.type}</span>
                </div>
                <div className="font-mono">
                  <span className="text-slate-500 block mb-1">Target Address / Account:</span>
                  <span className="font-mono font-bold text-white text-xs select-all break-all bg-[#05060A] border border-cyan-400/40 p-2 rounded-lg block text-[#00F0FF]">
                    {activeReceipt.depositDetails?.addressOrDetails}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                REGISTERED PAYOUT DESTINATION:
              </span>
              <span className="font-mono text-xs text-slate-300 bg-[#0A0E1A] p-2.5 rounded-lg border border-cyan-500/20 block truncate">
                {activeReceipt.withdrawDetails?.label}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-3.5 text-xs text-cyan-200 leading-relaxed mb-6">
            <Info className="h-4.5 w-4.5 text-[#00F0FF] shrink-0 mt-0.5" />
            <p>
              <strong>Order Settlement Status:</strong> This transfer has been cataloged as <span className="font-bold text-[#FFB800]">Pending Settlement</span>. Once validated, your simulated balance ledger will reflect the credited asset instantly.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveReceipt(null)}
              className="btn-neon-cyan px-6 py-2.5 rounded-xl text-xs font-orbitron font-bold tracking-wider"
            >
              EXECUTE ANOTHER SWAP
            </button>
          </div>
        </div>
      )}

      {/* PRIMARY SWAPPING CARD FORM */}
      {!activeReceipt && (
        <form onSubmit={handleSubmitSwap} className="cyber-card rounded-2xl p-6 sm:p-7 relative overflow-hidden">
          <span className="corner-bracket-tl" />
          <span className="corner-bracket-tr" />
          <span className="corner-bracket-bl" />
          <span className="corner-bracket-br" />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-500/20">
            <h3 className="font-orbitron text-lg font-black tracking-wide text-white flex items-center space-x-2">
              <Zap className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_#00F0FF]" />
              <span>SWAP TERMINAL</span>
            </h3>
            <span className="flex items-center space-x-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/40 px-3 py-1 text-[10px] font-mono font-bold text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-ping" />
              <span>ZERO SLIPPAGE ORACLE</span>
            </span>
          </div>

          {/* SELL ASSET BOX */}
          <div className="rounded-xl border border-cyan-500/25 bg-[#05060A]/70 p-4 mb-3 hover:border-cyan-400/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider">Sell Asset / Debit</span>
              <span className="text-cyan-400">
                Available: <strong className="text-white">{currentFromBalance.toFixed(fiatList.includes(fromCur) ? 2 : 4)}</strong> {fromCur}
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
                className="w-full flex-1 bg-transparent font-mono text-2xl font-bold text-white placeholder-slate-600 focus:outline-none"
                disabled={isSubmitting}
                required
              />
              <select
                value={fromCur}
                onChange={(e) => setFromCur(e.target.value)}
                className="rounded-xl border border-cyan-500/40 bg-[#0A0E1A] px-3.5 py-2 text-sm font-orbitron font-bold text-[#00F0FF] shadow-sm focus:outline-none focus:border-cyan-400"
                disabled={isSubmitting}
              >
                {allCurrencies.map((c) => (
                  <option key={c} value={c} className="bg-[#0A0E1A] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INTERCHANGE BUTTON */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwapCurrencies}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/50 bg-[#0A0E1A] text-cyan-300 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,240,255,0.6)] hover:scale-110 transition-all active:scale-95"
              title="Invert Direction"
              disabled={isSubmitting}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* BUY ASSET BOX */}
          <div className="rounded-xl border border-cyan-500/25 bg-[#05060A]/70 p-4 mb-4 hover:border-cyan-400/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider">Receive Asset / Credit</span>
              <span className="text-slate-400">
                Vault: <strong className="text-white">{user?.balances?.[toCur]?.toFixed(fiatList.includes(toCur) ? 2 : 4) || "0.00"}</strong> {toCur}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="w-full flex-1 bg-transparent font-mono text-2xl font-bold text-[#39FF14] glow-text-green focus:outline-none"
              />
              <select
                value={toCur}
                onChange={(e) => setToCur(e.target.value)}
                className="rounded-xl border border-cyan-500/40 bg-[#0A0E1A] px-3.5 py-2 text-sm font-orbitron font-bold text-[#00F0FF] shadow-sm focus:outline-none focus:border-cyan-400"
                disabled={isSubmitting}
              >
                {allCurrencies.map((c) => (
                  <option key={c} value={c} className="bg-[#0A0E1A] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SELECT WITHDRAW PAYOUT PROFILE */}
          <div className="mb-5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
              PAYOUT DESTINATION ({toCur})
            </label>
            {loadingPayouts ? (
              <div className="h-10 text-xs text-cyan-400/60 bg-[#05060A] border border-cyan-500/20 rounded-xl flex items-center justify-center font-mono">
                Querying configured node destinations...
              </div>
            ) : payouts.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedPayoutId}
                  onChange={(e) => setSelectedPayoutId(e.target.value)}
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#05060A] px-3.5 py-2.5 text-xs font-mono text-white focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] focus:outline-none"
                  disabled={isSubmitting}
                  required
                >
                  {payouts.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0A0E1A] text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3.5 border border-amber-500/40 bg-amber-950/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                <AlertCircle className="h-4.5 w-4.5 text-[#FFB800] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold font-orbitron mb-0.5">UNREGISTERED GATEWAY</p>
                  <p className="leading-relaxed mb-2 text-slate-300">
                    No target wallet or bank account is currently configured for <strong>{toCur}</strong>.
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center space-x-1 font-mono font-bold text-[#00F0FF] hover:underline"
                  >
                    <span>Register Payout Gateway Now &rarr;</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* QUOTE STABILITY RATES BLOCK */}
          {rate > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-[#05060A] border border-cyan-500/20 p-3 mb-5 font-mono text-xs">
              <span className="text-slate-400">Oracle Exchange Ratio:</span>
              <span className="text-[#00F0FF] font-bold">
                1 {fromCur} = {rate < 0.001 ? rate.toFixed(8) : rate.toFixed(5)} {toCur}
              </span>
            </div>
          )}

          {/* INSUFFICIENT MOCK BALANCES ALERT */}
          {fromAmount && insifficientBalance && (
            <div className="mb-5 flex items-start space-x-2 rounded-xl bg-red-950/40 border border-red-500/40 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4.5 w-4.5 text-[#FF0055] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-orbitron block mb-0.5">INSUFFICIENT RESERVES</span>
                <span className="text-slate-300">
                  Available: <strong>{currentFromBalance.toFixed(4)} {fromCur}</strong> (Requested: <strong>{parseFloat(fromAmount).toFixed(4)}</strong>).
                </span>
              </div>
            </div>
          )}

          {/* SUBMISSION BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || insifficientBalance || !selectedPayoutId || !fromAmount}
            className={`w-full py-3.5 rounded-xl text-center text-xs sm:text-sm font-orbitron font-black tracking-wider uppercase transition-all shadow-lg ${
              isSubmitting || insifficientBalance || !selectedPayoutId || !fromAmount
                ? "bg-[#0A0E1A] text-slate-600 border border-slate-800 cursor-not-allowed shadow-none"
                : "btn-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            }`}
          >
            {isSubmitting ? "TRANSMITTING TO ORACLE..." : "EXECUTE SWAP ORDER"}
          </button>
        </form>
      )}
    </div>
  );
}
