import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Coins,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Menu,
  X,
  ArrowRightLeft,
  LayoutDashboard,
  Wallet,
  Home,
  User,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-4 py-2 sm:py-3">
      <div className="mx-auto max-w-7xl flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 rounded-2xl bg-[#0A0E1A]/90 backdrop-blur-xl border border-cyan-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.7)] relative overflow-hidden">
        
        {/* Subtle top laser scan line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-70"></div>

        {/* Brand logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-2 sm:space-x-2.5 group">
            <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/30 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)] group-hover:scale-105 transition-transform">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-[#00F0FF] drop-shadow-[0_0_6px_#00F0FF]" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#39FF14] shadow-[0_0_6px_#39FF14]"></span>
            </div>
            <span className="font-orbitron text-base sm:text-lg md:text-xl font-black tracking-wider text-white">
              SMART<span className="text-[#00F0FF] glow-text-cyan">SWAP</span>
            </span>
          </Link>
        </div>

        {/* Desktop & Laptop navigation floating pill */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 px-2 lg:px-3 py-1.5 rounded-xl bg-[#05060A]/80 border border-cyan-500/20">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
                  isActive("/dashboard")
                    ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    : "text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                }`}
              >
                Traders Portal
              </Link>
              <Link
                to="/swap"
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
                  isActive("/swap")
                    ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    : "text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                }`}
              >
                Swap Terminal
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider uppercase transition-all ${
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

        {/* Action triggers (Desktop) */}
        <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
          {user ? (
            <>
              {/* Dynamic balance ticker preview on large tablets & laptops */}
              <div className="hidden xl:flex items-center space-x-2 rounded-xl border border-cyan-500/25 bg-[#05060A]/70 p-1.5 pr-2.5 text-xs">
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
                  <span>Admin Node</span>
                </Link>
              )}

              {/* Authed session details */}
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline-block text-xs font-mono text-slate-400 max-w-[120px] truncate">
                  ID: <span className="text-white font-bold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-500/60 hover:shadow-[0_0_12px_rgba(255,0,85,0.4)] transition-all"
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

        {/* Mobile / Small Screen Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <button
              onClick={() => refreshMe()}
              className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-xl border border-cyan-500/30 sm:hidden"
              title="Sync Balances"
              aria-label="Sync Balances"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-[#05060A]/90 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors focus:outline-none"
            aria-label="Toggle Mobile Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-[#FF0055]" /> : <Menu className="h-5 w-5 text-[#00F0FF]" />}
          </button>
        </div>

      </div>

      {/* Mobile & iPad Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl bg-[#0A0E1A]/95 backdrop-blur-2xl border border-cyan-500/30 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)] animate-fade-in relative z-50">
          <span className="corner-bracket-tl" />
          <span className="corner-bracket-tr" />
          <span className="corner-bracket-bl" />
          <span className="corner-bracket-br" />

          {/* User balance snapshot in mobile menu */}
          {user && (
            <div className="mb-4 p-3 rounded-xl bg-[#05060A] border border-cyan-500/20 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-white font-bold truncate max-w-[150px]">{user.name}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {user.role === "admin" ? "ADMIN" : "TRADER"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-400 text-[10px] block uppercase">USD Vault</span>
                  <span className="font-bold text-[#00F0FF]">
                    ${user.balances?.USD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                  </span>
                </div>
                <div className="bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-400 text-[10px] block uppercase">BTC Vault</span>
                  <span className="font-bold text-white">
                    {user.balances?.BTC?.toFixed(4) || "0.0000"} BTC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links list */}
          <div className="space-y-1.5 font-rajdhani text-sm font-bold tracking-wider uppercase">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive("/")
                  ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home className="h-4 w-4 text-[#00F0FF]" />
              <span>Home Hub</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive("/dashboard")
                      ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-[#00F0FF]" />
                  <span>Traders Portal</span>
                </Link>

                <Link
                  to="/swap"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive("/swap")
                      ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ArrowRightLeft className="h-4 w-4 text-[#00F0FF]" />
                  <span>Swap Terminal</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive("/profile")
                      ? "bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Wallet className="h-4 w-4 text-[#00F0FF]" />
                  <span>Payout Gateways</span>
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive("/admin")
                        ? "bg-amber-500/20 text-[#FFB800] border border-[#FFB800]/60 shadow-[0_0_10px_rgba(255,184,0,0.3)]"
                        : "text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4 text-[#FFB800]" />
                    <span>Admin Control Desk</span>
                  </Link>
                )}

                <div className="pt-2 border-t border-cyan-500/20 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 font-orbitron font-bold text-xs uppercase hover:bg-red-500/25 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-cyan-500/20 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-xs uppercase hover:bg-cyan-500/10 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="btn-neon-cyan flex items-center justify-center py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
