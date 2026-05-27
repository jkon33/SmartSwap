import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Coins, User as UserIcon, ShieldAlert, LogOut, RefreshCw, RefreshCwIcon, Server, Settings, X, Check, Loader2 } from "lucide-react";

export default function Navbar() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();

  // Connection settings state
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [backendUrlInput, setBackendUrlInput] = useState(
    localStorage.getItem("smartswap_backend_url") || ""
  );
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleTestAndSave = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let target = backendUrlInput.trim();
      if (!target) {
        localStorage.removeItem("smartswap_backend_url");
        setTestResult({ success: true, message: "Cleared override. Using standard relative paths." });
        setTesting(false);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
        return;
      }

      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = "https://" + target;
      }

      // Check the backend prices endpoint as dynamic healthcheck
      const checkUrl = target.endsWith("/api") ? `${target}/prices` : `${target}/api/prices`;
      const response = await fetch(checkUrl, { method: "GET" });
      if (response.ok) {
        localStorage.setItem("smartswap_backend_url", target);
        setTestResult({ success: true, message: "Successfully connected! Reloading to apply..." });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setTestResult({ success: false, message: `Failed: Server returned code ${response.status}.` });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Failed to connect: ${err.message || 'CORS cross-origin blocked or host unreachable.'}`
      });
    } finally {
      setTesting(false);
    }
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
              <Link to="/swap" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
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
          {/* Connection status indicator */}
          <button
            onClick={() => setShowServerSettings(true)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              localStorage.getItem("smartswap_backend_url")
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
            title="Configure Connected Server Backend Profile"
          >
            <Server className="h-3.5 w-3.5" />
            <span className="hidden leading-none lg:inline-block">
              {localStorage.getItem("smartswap_backend_url") ? "Vercel Sync On" : "Relative API Link"}
            </span>
          </button>

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

      {/* Backend Settings Dialog Modal overlay */}
      {showServerSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl animate-scale-up select-none">
            <button
              onClick={() => {
                setShowServerSettings(false);
                setTestResult(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-2 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Settings className="h-4 w-4" />
              </div>
              <h3 className="font-sans text-lg font-bold text-gray-900">API Server Endpoint Configuration</h3>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-semibold mb-4">
              When launching the static client in sandbox platforms (like Vercel), map it directly with your active Cloud Run full-stack environment URL to connect auth sessions, databases, and WebSocket streaming components sync arrays.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Cloud Run Backend base URL
                </label>
                <input
                  type="text"
                  placeholder="https://ais-pre-...run.app"
                  value={backendUrlInput}
                  onChange={(e) => setBackendUrlInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-250 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                />
                <span className="block text-[10px] text-gray-400 font-medium pt-1">
                  Leave empty and save to revert to relative base URL mapping (e.g. self-hosted).
                </span>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-semibold ${
                    testResult.success
                      ? "bg-emerald-50 border-emerald-150 text-emerald-800"
                      : "bg-red-50 border-red-150 text-red-800"
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTestAndSave}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-750 text-white py-2 text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center space-x-1"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Test & Save Configuration</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowServerSettings(false);
                    setTestResult(null);
                  }}
                  className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
