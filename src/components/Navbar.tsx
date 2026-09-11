import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Coins, ShieldAlert, LogOut, RefreshCw } from "lucide-react";

export default function Navbar() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 rounded-2xl bg-[#0A0E1A]/85 backdrop-blur-xl border border-cyan-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.7)] relative overflow-hidden">
        
        {/* Subtle top laser scan line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-70"></div>

        {/* Brand logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/30 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)] group-hover:scale-105 transition-transform">
              <Coins className="h-5 w-5 text-[#00F0FF] drop-shadow-[0_0_6px_#00F0FF]" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#39FF14] shadow-[0_0_6px_#39FF14]"></span>
            </div>
            <span className="font-orbitron text-lg sm:text-xl font-black tracking-wider text-white">
              SMART<span className="text-[#00F0FF] glow-text-cyan">SWAP</span>
            </span>
          </Link>
        </div>

        {/* Global navigation floating pill */}
        <nav className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#05060A]/80 border border-cyan-500/20">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
              isActive("/")
                ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                : "text-slate-300 hover:text-cyan-300 hover:bg-white/5"
            }`}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
                  isActive("/dashboard")
                    ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    : "text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                }`}
              >
                Traders Portal
              </Link>
              <Link
                to="/swap"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
                  isActive("/swap")
                    ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    : "text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                }`}
              >
                Swap Terminal
              </Link>
              <Link
                to="/profile"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
                  isActive("/profile")
                    ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    : "text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                }`}
              >
                Payout Gateways
              </Link>
            </>
          )}
        </nav>

        {/* Action triggers */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {user ? (
            <>
              {/* Dynamic balance ticker preview */}
              <div className="hidden lg:flex items-center space-x-2 rounded-xl border border-cyan-500/25 bg-[#05060A]/70 p-1.5 pr-2.5 text-xs">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-[#00F0FF] shadow-[0_0_6px_rgba(0,240,255,0.2)]">
                  USD: ${user.balances?.USD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  BTC: <span className="text-white font-bold">{user.balances?.BTC?.toFixed(4) || "0.0000"}</span>
                </span>
                <button
                  onClick={() => refreshMe()}
                  className="p-1 text-slate-400 hover:text-[#00F0FF] hover:bg-cyan-500/10 rounded transition-all"
                  title="Force Reload simulated balances"
                >
                  <RefreshCw className="h-3 w-3 hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* Admin Panel Link */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1.5 rounded-xl bg-amber-500/15 border border-[#FFB800]/50 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold text-[#FFB800] hover:bg-amber-500/25 hover:shadow-[0_0_12px_rgba(255,184,0,0.4)] transition-all"
                >
                  <ShieldAlert className="h-3.5 w-3.5 drop-shadow-[0_0_4px_#FFB800]" />
                  <span className="hidden sm:inline">Admin Node</span>
                </Link>
              )}

              {/* Authed session details */}
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                  ID: <span className="text-white font-bold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-500/60 hover:shadow-[0_0_12px_rgba(255,0,85,0.4)] transition-all"
                  aria-label="Logout"
                  title="Log out of Terminal"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-rajdhani font-bold tracking-wider uppercase text-slate-300 hover:text-[#00F0FF] px-2.5 sm:px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-neon-cyan rounded-xl px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-orbitron font-bold uppercase tracking-wider"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
