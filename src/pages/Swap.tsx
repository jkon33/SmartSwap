import SwapCard from "../components/SwapCard";
import { Info, Zap, ShieldCheck, ArrowRightLeft, Radio } from "lucide-react";

export default function Swap() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in relative z-10">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400">
              <ArrowRightLeft className="h-4 w-4" />
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">
              QUANTUM SETTLEMENT PROTOCOL
            </span>
          </div>
          <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white tracking-wide glow-text-cyan">
            DEFI SPOT SWAP TERMINAL
          </h1>
          <p className="text-slate-300 font-mono text-xs mt-1">
            Zero-slippage cross-chain and fiat swaps backed by multi-oracle aggregated pricing.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0A0E1A] border border-cyan-500/30 font-mono text-xs text-cyan-300">
          <Radio className="h-3.5 w-3.5 text-[#39FF14] animate-pulse" />
          <span>ROUTING: <strong className="text-white">OPTIMAL PATHWAY</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Core Swapper component */}
        <div className="lg:col-span-7">
          <SwapCard />
        </div>

        {/* Informative Instructions panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />

            <h3 className="font-orbitron font-bold text-white flex items-center space-x-2 text-xs uppercase tracking-wider mb-5">
              <Zap className="h-4 w-4 text-[#00F0FF] animate-pulse" />
              <span>SWAP EXECUTION CYCLE</span>
            </h3>

            <div className="relative border-l border-cyan-500/25 ml-3 pl-5 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
              
              <div className="relative">
                <span className="absolute -left-7 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-bold text-[#00F0FF] font-mono shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  1
                </span>
                <p className="font-orbitron font-bold text-white mb-0.5">Lock Oracle Conversion Rate</p>
                <p className="text-slate-400 font-mono text-[11px]">
                  Input asset volume. SmartSwap aggregates live bids and asks across decentralized pools every 2 seconds.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-7 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-bold text-[#00F0FF] font-mono shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  2
                </span>
                <p className="font-orbitron font-bold text-white mb-0.5">Generate Cryptographic Order</p>
                <p className="text-slate-400 font-mono text-[11px]">
                  Submit the transaction to lock the quote and generate an escrow deposit slip mapped to the admin custodian.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-7 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-bold text-[#00F0FF] font-mono shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  3
                </span>
                <p className="font-orbitron font-bold text-white mb-0.5">Simulated Liquidity Transfer</p>
                <p className="text-slate-400 font-mono text-[11px]">
                  Send your swapped balance. In this sandbox environment, simulated balances adjust automatically upon verification.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-7 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-bold text-[#00F0FF] font-mono shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  4
                </span>
                <p className="font-orbitron font-bold text-white mb-0.5">Instant Clearing &amp; Settlement</p>
                <p className="text-slate-400 font-mono text-[11px]">
                  The custodian node verifies incoming payment blocks and dispatches payout directly to your registered destination.
                </p>
              </div>

            </div>
          </div>

          <div className="cyber-card rounded-2xl p-5 border border-cyan-500/25 bg-cyan-950/20 space-y-2">
            <h4 className="font-orbitron font-bold text-xs text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-[#39FF14]" />
              <span>CUSTODIAL SAFETY DIRECTIVE</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              SmartSwap operates with sandboxed multi-asset custody simulation. Test accounts are pre-seeded with test balances so you can experiment with cross-pair liquidity routes.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
