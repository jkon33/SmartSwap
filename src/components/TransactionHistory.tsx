import { useState } from "react";
import { Transaction } from "../types";
import { ArrowRight, Hourglass, CheckCircle2, ChevronDown, ChevronUp, Radio, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  isAdminView?: boolean;
  onActionComplete?: () => void;
}

export default function TransactionHistory({
  transactions,
  isLoading,
  isAdminView = false,
}: TransactionHistoryProps) {
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 border border-[#FFB800]/50 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-[#FFB800] shadow-[0_0_8px_rgba(255,184,0,0.3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFB800] animate-ping" />
            <span>PENDING</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-[#39FF14]/50 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.3)]">
            <CheckCircle2 className="h-3 w-3 text-[#39FF14]" />
            <span>DISPATCHED</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-red-500/10 border border-[#FF0055]/50 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-[#FF0055]">
            <XCircle className="h-3 w-3 text-[#FF0055]" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="cyber-card rounded-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-cyan-400 font-mono text-xs relative overflow-hidden">
        <span className="corner-bracket-tl" />
        <span className="corner-bracket-tr" />
        <Hourglass className="h-8 w-8 text-[#00F0FF] animate-spin mb-3 drop-shadow-[0_0_8px_#00F0FF]" />
        <span className="tracking-widest uppercase glow-text-cyan text-center">READING ON-CHAIN ORACLE LEDGER...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="cyber-card rounded-2xl text-center p-8 sm:p-12 relative overflow-hidden border border-cyan-500/20">
        <span className="corner-bracket-tl" />
        <span className="corner-bracket-tr" />
        <span className="corner-bracket-bl" />
        <span className="corner-bracket-br" />
        <Radio className="h-8 w-8 text-cyan-400/50 mx-auto mb-3 animate-pulse" />
        <p className="text-slate-300 font-orbitron font-bold mb-1 text-sm sm:text-base">NO ON-CHAIN SWAP RECORDS DETECTED</p>
        <p className="text-xs text-slate-400 font-mono">Execute your initial swap from the Swap Terminal to generate ledger entries.</p>
      </div>
    );
  }

  return (
    <div className="cyber-card rounded-2xl overflow-hidden relative">
      <span className="corner-bracket-tl" />
      <span className="corner-bracket-tr" />
      <span className="corner-bracket-bl" />
      <span className="corner-bracket-br" />

      {/* MOBILE CARDS VIEW (< 768px) */}
      <div className="md:hidden divide-y divide-cyan-500/15">
        {transactions.map((tx) => {
          const isExpanded = expandedTxId === tx.id;
          return (
            <div key={`m-${tx.id}`} className="p-4 bg-[#0A0E1A]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-orbitron font-bold text-xs">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[10px]">
                    {tx.fromCurrency}
                  </span>
                  <ArrowRight className="h-3 w-3 text-cyan-400" />
                  <span className="px-2 py-0.5 rounded bg-fuchsia-950/70 border border-fuchsia-400/40 text-fuchsia-300 text-[10px]">
                    {tx.toCurrency}
                  </span>
                </div>
                {statusBadge(tx.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#05060A]/70 p-2.5 rounded-xl border border-cyan-500/15">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Sold / Debited</span>
                  <span className="text-white font-bold">-{tx.fromAmount} {tx.fromCurrency}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Received</span>
                  <span className="text-[#39FF14] font-bold">+{tx.toAmount} {tx.toCurrency}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="text-[#00F0FF] font-bold truncate max-w-[140px]">{tx.id}</span>
                <span className="text-[10px]">
                  {new Date(tx.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <button
                onClick={() => toggleExpand(tx.id)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900/50 transition"
              >
                <span>{isExpanded ? "Hide Receipt Details" : "View Receipt & Vault Coordinates"}</span>
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {/* Mobile Drawer Details */}
              {isExpanded && (
                <div className="mt-3 p-3.5 bg-[#05060A] rounded-xl border border-cyan-500/30 space-y-3 font-mono text-xs animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#FFB800] uppercase block">Admin Inbound Vault:</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-slate-300 break-all bg-[#0A0E1A] p-2 rounded border border-cyan-500/20 flex-1">
                        {tx.depositDetails?.addressOrDetails}
                      </span>
                      <button
                        onClick={() => handleCopyText(tx.depositDetails?.addressOrDetails, "Deposit Address")}
                        className="px-2 py-2 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded text-[10px] font-bold shrink-0"
                      >
                        COPY
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-cyan-500/15">
                    <span className="text-[10px] font-bold text-[#00F0FF] uppercase block">Payout Destination:</span>
                    <span className="text-[11px] text-slate-300 block bg-[#0A0E1A] p-2 rounded border border-cyan-500/20 break-all">
                      {tx.withdrawDetails?.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TABLE VIEW (>= 768px, Tablets & Laptops) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cyan-500/20 bg-[#05060A]/90 p-4 font-orbitron text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              {isAdminView && <th className="p-4">Trader Account</th>}
              <th className="p-4">Tx Reference</th>
              <th className="p-4">Conversion Vector</th>
              <th className="p-4">Swapped Quantities</th>
              <th className="p-4">Oracle Ratio</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/10 font-mono text-xs">
            {transactions.map((tx, idx) => {
              const isExpanded = expandedTxId === tx.id;
              return (
                <tr
                  key={tx.id}
                  className={`hover:bg-cyan-500/5 transition-colors ${
                    idx % 2 === 0 ? "bg-[#0A0E1A]/40" : "bg-transparent"
                  }`}
                >
                  {isAdminView && (
                    <td className="p-4 max-w-[150px] truncate">
                      <div className="font-bold text-white">{tx.userEmail}</div>
                      <div className="text-[10px] text-cyan-400/60">ID: {tx.userId}</div>
                    </td>
                  )}
                  <td className="p-4">
                    <span className="font-bold text-[#00F0FF]">{tx.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1.5 font-orbitron font-bold">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[10px]">
                        {tx.fromCurrency}
                      </span>
                      <ArrowRight className="h-3 w-3 text-cyan-400" />
                      <span className="px-2 py-0.5 rounded bg-fuchsia-950/70 border border-fuchsia-400/40 text-fuchsia-300 text-[10px]">
                        {tx.toCurrency}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-bold">
                      -{tx.fromAmount} {tx.fromCurrency}
                    </div>
                    <div className="text-[#39FF14] font-bold glow-text-green">
                      +{tx.toAmount} {tx.toCurrency}
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">
                    1 {tx.fromCurrency} = {tx.rate < 0.001 ? tx.rate.toFixed(8) : tx.rate.toFixed(4)} {tx.toCurrency}
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4">{statusBadge(tx.status)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleExpand(tx.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-[#0A0E1A] text-cyan-400 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all"
                      title="Inspect Receipt and Node details"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DRAW DETAILS INTERACTIVE ACCORDION (TABLET & DESKTOP) */}
      {transactions.map((tx) => {
        const isExpanded = expandedTxId === tx.id;
        if (!isExpanded) return null;

        return (
          <div key={`exp-${tx.id}`} className="hidden md:grid bg-[#05060A]/95 border-t border-cyan-500/20 p-5 font-mono text-xs grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Left box: Admin deposit (where user paid) */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#0A0E1A]">
              <span className="text-[10px] font-orbitron font-bold text-[#FFB800] uppercase tracking-widest block mb-2.5">
                ADMIN DEPOSITORY DESTINATION (PAYMENT INBOUND)
              </span>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <div>
                  <span className="text-slate-500">Method Type:</span>{" "}
                  <span className="font-bold text-white uppercase">{tx.depositDetails?.type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Currency Target:</span>{" "}
                  <span className="font-bold text-cyan-400 uppercase">{tx.depositDetails?.currency}</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-cyan-500/15">
                  <span className="text-slate-400 block mb-1 font-bold">Inbound Vault Coordinates:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#00F0FF] break-all select-all flex-1 p-2 rounded-lg bg-[#05060A] border border-cyan-500/30 text-xs">
                      {tx.depositDetails?.addressOrDetails}
                    </span>
                    <button
                      onClick={() => handleCopyText(tx.depositDetails?.addressOrDetails, "Deposit address")}
                      className="px-2.5 py-1.5 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded-lg text-[10px] font-bold hover:bg-cyan-900 transition shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                    >
                      COPY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right box: Customer withdrawal (where payout is sent) */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#0A0E1A]">
              <span className="text-[10px] font-orbitron font-bold text-[#00F0FF] uppercase tracking-widest block mb-2.5">
                CUSTOMER PAYOUT DESTINATION (SWAP TARGET)
              </span>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <div>
                  <span className="text-slate-500">Registered Destination:</span>{" "}
                  <span className="font-bold text-white">{tx.withdrawDetails?.label}</span>
                </div>
                <div>
                  <span className="text-slate-500">Target Currency:</span>{" "}
                  <span className="font-bold text-[#39FF14] uppercase">{tx.toCurrency}</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-cyan-500/15">
                  <span className="text-slate-400 block mb-1 font-bold">Settlement Details:</span>
                  <span className="block font-bold text-slate-300 break-all p-2 rounded-lg bg-[#05060A] border border-cyan-500/30 text-xs">
                    {tx.withdrawDetails?.address || tx.withdrawDetails?.accountNumber 
                      ? `${tx.withdrawDetails?.address || tx.withdrawDetails?.accountNumber} (${tx.withdrawDetails?.bankName || "Wallet"})`
                      : tx.withdrawDetails?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
