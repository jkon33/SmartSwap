import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Wallet, Plus, Landmark, ArrowRightLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();

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
      toast.success("Crypto payout destination registered!");
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in relative z-10">
      
      {/* Header section */}
      <div className="border-b border-cyan-500/20 pb-6">
        <div className="flex items-center space-x-2 mb-1">
          <span className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400">
            <ArrowRightLeft className="h-4 w-4" />
          </span>
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">
            SETTLEMENT GATEWAY REPOSITORY
          </span>
        </div>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white tracking-wide glow-text-cyan">
          PAYOUT DESTINATIONS
        </h1>
        <p className="text-slate-300 font-mono text-xs mt-1">
          Configure on-chain wallet addresses and sovereign bank rails for automated swap settlement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Currently configured destinations list */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Crypto wallets list card */}
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />

            <h3 className="font-orbitron text-xs font-bold text-white flex items-center space-x-2 uppercase tracking-wider mb-4 pb-3 border-b border-cyan-500/20">
              <Wallet className="h-4 w-4 text-[#00F0FF]" />
              <span>REGISTERED CRYPTO VAULTS</span>
            </h3>

            {loadingPayouts ? (
              <p className="text-xs text-cyan-400 font-mono animate-pulse">Querying wallets database...</p>
            ) : wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.map((w: any) => (
                  <div key={w.id} className="p-3.5 border border-cyan-500/20 rounded-xl bg-[#05060A]/70 font-mono text-xs flex justify-between items-start hover:border-cyan-400/60 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-bold font-orbitron text-[10px]">
                          {w.currency}
                        </span>
                        <span className="font-orbitron font-bold text-white text-xs">
                          {w.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#00F0FF] break-all max-w-[340px] select-all">
                        {w.address}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#39FF14] bg-emerald-950/40 border border-[#39FF14]/40 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-cyan-500/30 rounded-xl bg-[#05060A]/50">
                <p className="text-xs text-slate-400 font-mono">No registered payout crypto addresses found</p>
              </div>
            )}
          </div>

          {/* Bank Accounts list card */}
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />

            <h3 className="font-orbitron text-xs font-bold text-white flex items-center space-x-2 uppercase tracking-wider mb-4 pb-3 border-b border-cyan-500/20">
              <Landmark className="h-4 w-4 text-[#39FF14]" />
              <span>REGISTERED COMMERCIAL BANK RAILS</span>
            </h3>

            {loadingPayouts ? (
              <p className="text-xs text-cyan-400 font-mono animate-pulse">Querying fiat database...</p>
            ) : banks.length > 0 ? (
              <div className="space-y-3">
                {banks.map((b: any) => (
                  <div key={b.id} className="p-3.5 border border-cyan-500/20 rounded-xl bg-[#05060A]/70 font-mono text-xs flex justify-between items-start hover:border-emerald-400/60 transition">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-[#39FF14]/40 text-[#39FF14] font-bold font-orbitron text-[10px]">
                          FIAT WIRE
                        </span>
                        <span className="font-orbitron font-bold text-white text-xs">
                          {b.label}
                        </span>
                      </div>
                      <div className="text-[11px] space-y-0.5 text-slate-300">
                        <p>Bank Entity: <span className="text-white font-bold">{b.bankName}</span></p>
                        <p>Account/IBAN: <span className="text-[#00F0FF] select-all font-bold">{b.accountNumber}</span></p>
                        <p>Routing/SWIFT: <span className="text-white select-all">{b.routingNumber}</span></p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#39FF14] bg-emerald-950/40 border border-[#39FF14]/40 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-cyan-500/30 rounded-xl bg-[#05060A]/50">
                <p className="text-xs text-slate-400 font-mono">No registered payout bank profiles found</p>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Forms to register new accounts */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Create Crypto wallet form */}
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />

            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5 mb-4">
              <Plus className="h-4 w-4 text-[#00F0FF]" />
              <span>CONFIGURE CRYPTO DESTINATION</span>
            </h3>

            <form onSubmit={handleCreateCrypto} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Currency Ticker
                  </label>
                  <select
                    value={cryptoCurrency}
                    onChange={(e) => setCryptoCurrency(e.target.value)}
                    className="w-full text-xs font-orbitron font-bold bg-[#05060A] text-[#00F0FF] border border-cyan-500/30 rounded-xl px-3 py-2.5 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="BTC" className="bg-[#0A0E1A]">BTC</option>
                    <option value="ETH" className="bg-[#0A0E1A]">ETH</option>
                    <option value="USDT" className="bg-[#0A0E1A]">USDT</option>
                    <option value="SOL" className="bg-[#0A0E1A]">SOL</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Custom Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ledger Cold Vault"
                    value={cryptoLabel}
                    onChange={(e) => setCryptoLabel(e.target.value)}
                    className="w-full text-xs bg-[#05060A] text-white border border-cyan-500/30 rounded-xl px-3 py-2.5 focus:border-cyan-400 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Crypto Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0x98311a... or 3FZbg..."
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  className="w-full font-mono text-xs bg-[#05060A] text-white border border-cyan-500/30 rounded-xl px-3 py-2.5 focus:border-cyan-400 focus:outline-none placeholder-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCrypto}
                className="w-full py-2.5 rounded-xl btn-neon-cyan font-orbitron font-bold text-xs uppercase tracking-wider"
              >
                {isSubmittingCrypto ? "ENCRYPTING ADDRESS..." : "REGISTER CRYPTO VAULT"}
              </button>
            </form>
          </div>

          {/* Create Bank Account form */}
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />

            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5 mb-4">
              <Plus className="h-4 w-4 text-[#39FF14]" />
              <span>CONFIGURE BANK PAYOUT RAIL</span>
            </h3>

            <form onSubmit={handleCreateBank} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Label / Alias
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corporate Treasury"
                    value={bankLabel}
                    onChange={(e) => setBankLabel(e.target.value)}
                    className="w-full text-xs bg-[#05060A] text-white border border-cyan-500/30 rounded-xl px-3 py-2 focus:border-cyan-400 focus:outline-none placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Bank Institution
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barclays Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-xs bg-[#05060A] text-white border border-cyan-500/30 rounded-xl px-3 py-2 focus:border-cyan-400 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GB12 BARC 2000 0011 2233 44"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full font-mono text-xs bg-[#05060A] text-white border border-cyan-500/30 rounded-xl px-3 py-2 focus:border-cyan-400 focus:outline-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Routing / Sort Code / SWIFT
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20-00-00 or DEUTDEDDXXX"
                  value={bankRouting}
                  onChange={(e) => setBankRouting(e.target.value)}
                  className="w-full font-mono text-xs bg-[#05060A] text-white border border-cyan-500/30 rounded-xl px-3 py-2 focus:border-cyan-400 focus:outline-none placeholder-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingBank}
                className="w-full py-2.5 rounded-xl btn-neon-green font-orbitron font-bold text-xs uppercase tracking-wider"
              >
                {isSubmittingBank ? "VALIDATING ACCOUNT..." : "REGISTER BANK PROFILE"}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
