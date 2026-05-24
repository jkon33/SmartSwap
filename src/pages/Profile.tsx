import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Wallet, Building, Plus, Landmark, ShieldCheck, CheckSquare, Trash, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, refreshMe } = useAuth();

  // State
  const [wallets, setWallets] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  // Forms State
  const [cryptoCurrency, setCryptoCurrency] = useState("BTC");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoLabel, setCryptoLabel] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankRouting, setBankRouting] = useState("");
  const [bankLabel, setBankLabel] = useState("");

  const [isSubmittingCrypto, setIsSubmittingCrypto] = useState(false);
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);

  const fetchPayoutDetails = async () => {
    try {
      const data = await api.user.getWithdrawalMethods();
      setWallets(data.cryptoWallets || []);
      setBanks(data.bankAccounts || []);
    } catch (err) {
      console.error("Failed to load payout destinations:", err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayoutDetails();
    }
  }, [user]);

  const handleCreateCrypto = async (e: FormEvent) => {
    e.preventDefault();
    if (!cryptoAddress || !cryptoLabel) {
      toast.error("Please provide address and naming label.");
      return;
    }

    setIsSubmittingCrypto(true);
    try {
      await api.user.addCryptoWallet(cryptoCurrency, cryptoAddress, cryptoLabel);
      toast.success("Crypto payout wallet registered!");
      setCryptoAddress("");
      setCryptoLabel("");
      await fetchPayoutDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to save wallet address.");
    } finally {
      setIsSubmittingCrypto(false);
    }
  };

  const handleCreateBank = async (e: FormEvent) => {
    e.preventDefault();
    if (!bankName || !bankAccount || !bankRouting || !bankLabel) {
      toast.error("Please provide all banking context fields.");
      return;
    }

    setIsSubmittingBank(true);
    try {
      await api.user.addBankAccount(bankName, bankAccount, bankRouting, bankLabel);
      toast.success("Banking payout profile registered!");
      setBankName("");
      setBankAccount("");
      setBankRouting("");
      setBankLabel("");
      await fetchPayoutDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to save bank credentials.");
    } finally {
      setIsSubmittingBank(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div>
        <h1 className="font-sans text-2xl font-black text-gray-900 tracking-tight">Withdrawal & Payout Profiles</h1>
        <p className="text-gray-500 font-medium text-xs mt-1">
          Configure payout destination wallets and bank accounts. SmartSwap routes completed swaps directly to these references.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Currently configured destinations list */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Crypto wallets list card */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-md shadow-gray-100">
            <h3 className="font-sans text-sm font-bold text-gray-900 flex items-center space-x-2 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              <Wallet className="h-4.5 w-4.5 text-blue-600" />
              <span>Registered Crypto Wallets</span>
            </h3>

            {loadingPayouts ? (
              <p className="text-xs text-slate-400 font-mono">Querying wallets database...</p>
            ) : wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.map((w: any) => (
                  <div key={w.id} className="p-3.5 border border-gray-150 rounded-xl bg-gray-55 font-mono text-xs flex justify-between items-start hover:border-violet-200 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold scale-95">
                          {w.currency}
                        </span>
                        <span className="font-sans font-bold text-gray-800 text-sm">
                          {w.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold break-all max-w-[340px] select-all">
                        {w.address}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 font-sans italic bg-white px-2 py-0.5 border border-gray-150 rounded-md">
                      Active Target
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-400 font-medium">No registered payout crypto wallets</p>
              </div>
            )}
          </div>

          {/* Bank Accounts list card */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-md shadow-gray-100">
            <h3 className="font-sans text-sm font-bold text-gray-900 flex items-center space-x-2 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              <Landmark className="h-4.5 w-4.5 text-blue-600" />
              <span>Registered Bank Accounts</span>
            </h3>

            {loadingPayouts ? (
              <p className="text-xs text-slate-400 font-mono">Querying fiat database...</p>
            ) : banks.length > 0 ? (
              <div className="space-y-3">
                {banks.map((b: any) => (
                  <div key={b.id} className="p-3.5 border border-gray-150 rounded-xl bg-gray-55 font-mono text-xs flex justify-between items-start hover:border-violet-200 transition">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold scale-95 uppercase">
                          FIAT Bank
                        </span>
                        <span className="font-sans font-bold text-gray-800 text-sm">
                          {b.label}
                        </span>
                      </div>
                      <div className="text-[10px] space-y-0.5 leading-relaxed text-gray-650 font-bold">
                        <p>Bank: <span className="text-slate-900">{b.bankName}</span></p>
                        <p>Account: <span className="text-slate-900 select-all">{b.accountNumber}</span></p>
                        <p>Routing ID: <span className="text-slate-900 select-all">{b.routingNumber}</span></p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 font-sans italic bg-white px-2 py-0.5 border border-gray-150 rounded-md">
                      Active Target
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-400 font-medium">No registered payout bank profiles</p>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Forms to register new accounts */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Create Crypto wallet form */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-md shadow-gray-100">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5 mb-4">
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Configure Crypto Payout Wallet</span>
            </h3>

            <form onSubmit={handleCreateCrypto} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Currency Ticker
                  </label>
                  <select
                    value={cryptoCurrency}
                    onChange={(e) => setCryptoCurrency(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Custom Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., My Ledger wallet"
                    value={cryptoLabel}
                    onChange={(e) => setCryptoLabel(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Crypto Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 0x98311a... or 3FZbg..."
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  className="w-full font-mono text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCrypto}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                {isSubmittingCrypto ? "Crypting keys..." : "Register Payout Wallet"}
              </button>
            </form>
          </div>

          {/* Create Bank Account form */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-md shadow-gray-100">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5 mb-4">
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Configure Bank Payout Account</span>
            </h3>

            <form onSubmit={handleCreateBank} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Short Nickname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Savings Account"
                    value={bankLabel}
                    onChange={(e) => setBankLabel(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Barclays Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., GB12 BARC 2000 0011 2233 44"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full font-mono text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Routing / Sort Code / BIC
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 20-00-00 or DEUTDEDDXXX"
                  value={bankRouting}
                  onChange={(e) => setBankRouting(e.target.value)}
                  className="w-full font-mono text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingBank}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                {isSubmittingBank ? "Validating codes..." : "Register Payout Account"}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
