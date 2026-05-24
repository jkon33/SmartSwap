import SwapCard from "../components/SwapCard";
import { Info, Sparkles, Key, CheckSquare, Zap, ShieldAlert } from "lucide-react";

export default function Swap() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Visual Header */}
      <div>
        <h1 className="font-sans text-2xl font-black text-gray-900 tracking-tight">DeFi Spot Swap Engine</h1>
        <p className="text-gray-500 font-medium text-xs mt-1">
          Swap between major digital coins and global currencies instantly. Rates update in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Core Swapper component */}
        <div className="lg:col-span-7">
          <SwapCard />
        </div>

        {/* Informative Instructions panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-md shadow-gray-100">
            <h3 className="font-sans font-bold text-gray-900 flex items-center space-x-2 text-sm uppercase tracking-wide mb-4">
              <Zap className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
              <span>SmartSwap Swapping Cycle</span>
            </h3>

            <div className="relative border-l border-gray-100 ml-3.5 pl-5 space-y-5 text-xs text-gray-600 leading-relaxed">
              
              <div className="relative">
                <span className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 font-mono">
                  1
                </span>
                <p className="font-bold text-gray-900 mb-1">Lock In Real-time Rate</p>
                <p>
                  Input desired conversion quantities. Our system monitors direct global liquidity ratios to compute index valuations dynamically every 2 seconds.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 font-mono">
                  2
                </span>
                <p className="font-bold text-gray-900 mb-1">Initiate Order Receipt</p>
                <p>
                  Press submit to finalize your receipt. This creates a secure pending request with a dynamic depository wallet/bank address configured on the Admin board.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 font-mono">
                  3
                </span>
                <p className="font-bold text-gray-900 mb-1">Make Sandbox Asset Deposit</p>
                <p>
                  Send your swapped amount to the listed admin deposit destination. For user sandbox testing, standard balances are automatically adjusted after approval.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 font-mono">
                  4
                </span>
                <p className="font-bold text-gray-900 mb-1">Administrative Clearing</p>
                <p>
                  The administrator confirms deposits on their dashboard and issues immediate dispatch clear. Your target profile balance will then show the exchanged asset.
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-2.5">
            <h4 className="font-sans font-bold text-xs text-blue-900 uppercase tracking-widest flex items-center space-x-1.5Packed">
              <Info className="h-4 w-4 text-blue-600" />
              <span>Safety and Settlement Notice</span>
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              This is a de-fiat sandbox testing blockchain applet. No real financial credentials or funds are moved. Accounts are seeded with active testing amounts. Feel free to trade up to testing margins.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
