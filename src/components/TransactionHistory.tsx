import { useState } from "react";
import { Transaction } from "../types";
import { Eye, EyeOff, Calendar, ArrowRight, Hourglass, CheckCircle2, ChevronDown, ChevronUp, Copy, Clock, Key } from "lucide-react";
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
  onActionComplete,
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
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 border border-amber-205 px-2.5 py-1 text-xs font-semibold text-amber-700 animate-pulse">
            <Clock className="h-3 w-3" />
            <span>Pending Sync</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Dispatched</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700">
            <Clock className="h-3 w-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-gray-150 rounded-2xl bg-white shadow-sm font-mono text-sm text-gray-400">
        <Hourglass className="h-8 w-8 text-blue-500 animate-spin mb-3" />
        <span>Loading exchange transactions...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-gray-200 rounded-2xl bg-white shadow-sm">
        <p className="text-slate-400 font-medium mb-1">No transaction history found</p>
        <p className="text-xs text-gray-500">Initiate your first swap to start trading crypto and fiat!</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-105 bg-gray-50/70 p-4 font-sans text-xs font-bold uppercase tracking-wider text-gray-500">
              {isAdminView && <th className="p-4">Trader Account</th>}
              <th className="p-4">Tx Reference ID</th>
              <th className="p-4">Conversion Execution</th>
              <th className="p-4">Amount Swapped</th>
              <th className="p-4">Exchange Rate</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-sm text-gray-700">
            {transactions.map((tx) => {
              const isExpanded = expandedTxId === tx.id;
              return (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                  {isAdminView && (
                    <td className="p-4 font-sans max-w-[150px] truncate">
                      <div className="font-semibold text-slate-900">{tx.userEmail}</div>
                      <div className="text-[10px] text-gray-400">ID: {tx.userId}</div>
                    </td>
                  )}
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-slate-800">{tx.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 font-sans font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-205 text-gray-700 text-xs">
                        {tx.fromCurrency}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs">
                        {tx.toCurrency}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-900 text-xs font-bold">
                      -{tx.fromAmount} {tx.fromCurrency}
                    </div>
                    <div className="text-blue-600 font-bold text-xs">
                      +{tx.toAmount} {tx.toCurrency}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-slate-700">
                    1 {tx.fromCurrency} = {tx.rate < 0.001 ? tx.rate.toFixed(8) : tx.rate.toFixed(4)} {tx.toCurrency}
                  </td>
                  <td className="p-4 text-xs text-gray-500 font-sans">
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
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-150 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Inspect Receipt and Addresses details"
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

      {/* DRAW DETAILS INTERACTIVE ACCORDION */}
      {transactions.map((tx) => {
        const isExpanded = expandedTxId === tx.id;
        if (!isExpanded) return null;

        return (
          <div key={`exp-${tx.id}`} className="bg-slate-50 border-t border-gray-150 p-5 font-mono text-xs grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Left box: Admin deposit (where user paid) */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-2.5">
                Admin Depository Detail (Payment Sent To)
              </span>
              <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
                <div>
                  <span className="text-gray-400">Method Type:</span>{" "}
                  <span className="font-bold text-slate-900 uppercase">{tx.depositDetails?.type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Currency Target:</span>{" "}
                  <span className="font-bold text-slate-950 uppercase">{tx.depositDetails?.currency}</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-100">
                  <span className="text-gray-400 block mb-1 font-bold">Payout Destination / Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 break-all select-all flex-1 p-2 rounded bg-gray-50 border border-gray-200 text-xs">
                      {tx.depositDetails?.addressOrDetails}
                    </span>
                    <button
                      onClick={() => handleCopyText(tx.depositDetails?.addressOrDetails, "Deposit instructions")}
                      className="px-2 py-1 bg-slate-900 border text-white rounded text-[10px] font-bold shrink-0 shadow-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right box: Customer withdrawal (where payout is sent) */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2.5">
                Customer Withdraw Method (Swap Dispatched To)
              </span>
              <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
                <div>
                  <span className="text-gray-400">Method Profile:</span>{" "}
                  <span className="font-bold text-slate-900">{tx.withdrawDetails?.label}</span>
                </div>
                {tx.withdrawDetails?.address && (
                  <div>
                    <span className="text-gray-400">Crypto Address:</span>{" "}
                    <span className="font-bold text-slate-800 break-all bg-gray-50 border border-gray-100 p-1.5 rounded inline-block select-all w-full">
                      {tx.withdrawDetails?.address}
                    </span>
                  </div>
                )}
                {tx.withdrawDetails?.bankName && (
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 mt-2 space-y-1">
                    <div>
                      <span className="text-gray-400">Bank Name:</span>{" "}
                      <span className="font-bold text-slate-900">{tx.withdrawDetails?.bankName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Account Number:</span>{" "}
                      <span className="font-bold text-slate-900">{tx.withdrawDetails?.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Routing Sort Code:</span>{" "}
                      <span className="font-bold text-slate-900">{tx.withdrawDetails?.routingNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
