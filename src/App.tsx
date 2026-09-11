import { HashRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { ReactNode, useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/Navbar";
import PriceTicker from "./components/PriceTicker";
import EmailVerification from "./components/EmailVerification";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";

import {
  ArrowRightLeft,
  ShieldAlert,
  Sparkles,
  Landmark,
  Coins,
  ArrowRight,
  Zap,
  Activity,
  Cpu,
  Lock,
  Globe,
  Radio,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

// Protected route wrapper for basic customers
function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center font-mono text-xs text-cyan-400 bg-[#05060A]">
        <div className="h-10 w-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_12px_#00F0FF]" />
        <span className="tracking-widest uppercase glow-text-cyan">Authenticating Quantum Node Keys...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isEmailVerified === false) {
    return <EmailVerification />;
  }

  return <>{children}</>;
}

// Protected route wrapper for admins
function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center font-mono text-xs text-amber-400 bg-[#05060A]">
        <div className="h-10 w-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_12px_#FFB800]" />
        <span className="tracking-widest uppercase">Auditing Admin Clearances...</span>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Core landing banner home page UI
function HomeLanding() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-12 md:py-20 animate-fade-in relative z-10">
      
      {/* Dynamic Hero greeting panel */}
      <div className="mx-auto max-w-4xl text-center space-y-6 px-4">
        <span className="inline-flex items-center space-x-2 rounded-full bg-cyan-950/60 border border-cyan-400/40 px-3.5 py-1 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
          <Sparkles className="h-3.5 w-3.5 text-[#00F0FF] animate-pulse" />
          <span className="tracking-wider uppercase">DEFI SPOT SWAP PROTOCOL v3.0</span>
        </span>

        <h1 className="font-orbitron text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white select-none leading-tight">
          Next-Gen Crypto &amp; Fiat{" "}
          <span className="bg-gradient-to-r from-[#00F0FF] via-[#FF00E5] to-[#39FF14] bg-clip-text text-transparent glow-text-cyan">
            Liquidity Hub
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 font-rajdhani font-semibold text-lg leading-relaxed">
          Zero slippage latency. Real-time multi-exchange oracle feeds. Sub-second swaps with full custodial autonomy.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="btn-neon-cyan rounded-xl px-7 py-3 text-sm font-orbitron font-bold tracking-wider text-white shadow-lg flex items-center space-x-2 group"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn-neon-cyan rounded-xl px-7 py-3 text-sm font-orbitron font-bold tracking-wider text-white shadow-lg flex items-center space-x-2 group"
              >
                <span>Initialize Account</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn-neon-magenta rounded-xl px-7 py-3 text-sm font-orbitron font-bold tracking-wider text-white shadow-lg transition"
              >
                Sign In Node
              </Link>
            </>
          )}
        </div>

        {/* Live network stat pill badges */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0A0E1A]/80 border border-cyan-500/20">
            <Radio className="h-3 w-3 text-[#39FF14] animate-pulse" />
            <span>ORACLE STATUS: <span className="text-[#39FF14] font-bold">100% OPERATIONAL</span></span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0A0E1A]/80 border border-cyan-500/20">
            <Zap className="h-3 w-3 text-[#00F0FF]" />
            <span>AVG EXECUTION: <span className="text-[#00F0FF] font-bold">&lt; 380MS</span></span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0A0E1A]/80 border border-cyan-500/20">
            <Lock className="h-3 w-3 text-[#FF00E5]" />
            <span>SECURITY: <span className="text-[#FF00E5] font-bold">MIL-GRADE HSM</span></span>
          </div>
        </div>
      </div>

      {/* Feature showcase cards with cyber brackets */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-400 transition-colors">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />
            
            <div className="h-11 w-11 bg-cyan-950/70 border border-cyan-400/50 text-[#00F0FF] rounded-xl flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <h3 className="font-orbitron font-bold text-white text-base tracking-wide mb-2">
              Instant Swapping Engine
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Sub-second price quotes and transaction settlement eliminating traditional multi-block latency. Hybrid automated market-making algorithms calculate optimized liquidity paths dynamically.
            </p>
          </div>

          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden group hover:border-[#39FF14] transition-colors">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />

            <div className="h-11 w-11 bg-emerald-950/70 border border-[#39FF14]/50 text-[#39FF14] rounded-xl flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(57,255,20,0.4)]">
              <Landmark className="h-5 w-5" />
            </div>
            <h3 className="font-orbitron font-bold text-white text-base tracking-wide mb-2">
              Crypto-to-Fiat Settlement
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Bridge on-chain assets with global commercial banking rails. Move liquidity seamlessly between 50+ decentralized tokens and sovereign fiat currencies (USD, EUR, GBP) via direct SEPA/ACH wires.
            </p>
          </div>

          <div className="cyber-card rounded-2xl p-6 relative overflow-hidden group hover:border-[#FF00E5] transition-colors">
            <span className="corner-bracket-tl" />
            <span className="corner-bracket-tr" />
            <span className="corner-bracket-bl" />
            <span className="corner-bracket-br" />

            <div className="h-11 w-11 bg-fuchsia-950/70 border border-[#FF00E5]/50 text-[#FF00E5] rounded-xl flex items-center justify-center mb-4 shadow-[0_0_12px_rgba(255,0,229,0.4)]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-orbitron font-bold text-white text-base tracking-wide mb-2">
              Hardware-Grade Security
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Multi-signature MPC custody architecture protects against unauthorized dispatch. Segregated liquidity reserves and automated transaction anomaly screening protect every trading unit.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [scanlines, setScanlines] = useState(() => {
    return localStorage.getItem("smartswap_scanlines") === "true";
  });

  const toggleScanlines = () => {
    const next = !scanlines;
    setScanlines(next);
    localStorage.setItem("smartswap_scanlines", String(next));
  };

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-[#05060A] cyber-grid-bg flex flex-col font-sans antialiased text-slate-200 relative selection:bg-cyan-500 selection:text-black">
            
            {/* Optional CRT Scanlines overlay */}
            {scanlines && <div className="fixed inset-0 scanlines-overlay z-50 pointer-events-none" />}

            {/* Glowing background ambient radial flares */}
            <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-fuchsia-600/10 blur-[130px] pointer-events-none" />

            {/* Real-time rates floating ticker header */}
            <PriceTicker scanlinesEnabled={scanlines} onToggleScanlines={toggleScanlines} />

            <Navbar />

            {/* Notification framework alerts */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#0A0E1A",
                  color: "#FFFFFF",
                  border: "1px solid rgba(0, 240, 255, 0.4)",
                  boxShadow: "0 0 15px rgba(0, 240, 255, 0.3)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                },
              }}
            />

            <main className="flex-grow">
              <Routes>
                {/* Guest access portal */}
                <Route path="/" element={<HomeLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Secure customer portals */}
                <Route
                  path="/dashboard"
                  element={
                    <AuthGuard>
                      <Dashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/swap"
                  element={
                    <AuthGuard>
                      <Swap />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <AuthGuard>
                      <Profile />
                    </AuthGuard>
                  }
                />

                {/* Secure root administrative desk */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  }
                />

                {/* Fallback rewrite */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <footer className="border-t border-cyan-500/20 bg-[#05060A]/95 py-8 mt-16 relative z-10">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 font-orbitron font-bold text-xs tracking-wider text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-[#39FF14] shadow-[0_0_6px_#39FF14]"></span>
                  <span>SMARTSWAP GLOBAL DEFI NETWORK</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-wide text-center sm:text-right">
                  &copy; 2026 SmartSwap Cybernetics. Verified by Oluwaseun Asekoni Johnson
                </p>
              </div>
            </footer>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
