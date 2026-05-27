import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Coins, ShieldAlert, LogOut, RefreshCw } from "lucide-react";

export default function Navbar() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-150 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-100">
              <Coins className="h-5 w-5" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-gray-900">
              Smart<span className="text-blue-600">Swap</span>
            </span>
          </Link>
        </div>

        {/* Global navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Traders Portal
              </Link>
              <Link to="/swap" className="text-sm font-medium text-gray-650 hover:text-gray-900 transition-colors">
                Swap Currencies
              </Link>
              <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Payout Settings
              </Link>
            </>
          )}
        </nav>

        {/* Action triggers */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Dynamic balance ticker preview */}
              <div className="hidden lg:flex items-center space-x-2 rounded-xl border border-gray-200 bg-gray-50/50 p-1.5 pr-3 text-sm">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-gray-150 text-gray-700">
                  USD: ${user.balances?.USD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </span>
                <span className="font-mono text-xs text-gray-500">
                  BTC: {user.balances?.BTC?.toFixed(4) || "0.0000"}
                </span>
                <button
                  onClick={() => refreshMe()}
                  className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-150 rounded-lg transition-all"
                  title="Force Reload simulated balances"
                >
                  <RefreshCw className="h-3 w-3 animate-spin-slow" />
                </button>
              </div>

              {/* Admin Panel Link */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1.5 rounded-lg bg-amber-50 border border-amber-250 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Authed session details */}
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-block text-xs font-medium text-gray-600">
                  Hi, <span className="text-gray-900 font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-150 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

