import { HashRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { ReactNode } from "react";
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

import { ArrowRightLeft, ShieldAlert, Sparkles, Landmark, Coins, CheckCircle, ArrowRight } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Protected route wrapper for basic customers
function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center font-mono text-xs text-gray-400">
        Authenticating Secure Keys...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isEmailVerified === false) {
    return <EmailVerification />;
  }

  return children;
}

// Protected route wrapper for admins
function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center font-mono text-xs text-gray-450">
        Auditing Admin credentials...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Core landing banner home page UI
function HomeLanding() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-12 md:py-20 animate-fade-in">
      {/* Dynamic Hero greeting panel */}
      <div className="mx-auto max-w-4xl text-center space-y-6 px-4">
        <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 border border-blue-150 px-3 py-1 text-xs font-semibold text-blue-700">
          <Sparkles className="h-3.5 w-3.5 inline text-blue-600 animate-spin" />
          <span>Instant Multi-Asset Smart Swapping Platform</span>
        </span>

        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl select-none leading-none">
          Instant Crypto & Fiat Swaps <br />
          <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Start swapping
          </span> in 30 seconds.
        </h1>

        <p className="mx-auto max-w-xl text-sm md:text-base text-gray-500 font-medium leading-relaxed">
          No hidden fees. Real-time rates. Full control.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition flex items-center space-x-1.5"
            >
              <span>Go to Traders Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition flex items-center space-x-1.5"
              >
                <span>Register an Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-gray-250 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature showcase lists */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white rounded-2xl border border-gray-150 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-bold text-gray-900 text-base">Instant Swapping: Real-Time Liquidity at Your Fingertips</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              SmartSwap's instant swapping engine delivers sub-second price quotes and transaction execution, eliminating the traditional 10-30 minute exchange wait times. Our hybrid architecture combines real-time price feeds with automated matching to create a seamless swap experience.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-150 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-bold text-gray-900 text-base">Crypto-to-Crypto & Bank Funding: Bridging Digital and Traditional Finance</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              SmartSwap eliminates the gap between cryptocurrency and traditional banking by offering bidirectional funding options. Users can seamlessly move value between 50+ cryptocurrencies and 15+ fiat currencies using bank transfers, debit cards, or crypto deposits.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-150 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-bold text-gray-900 text-base">Security: Multi-Layer Protection for Every Transaction</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              SmartSwap implements defense-in-depth security architecture with 7 layers of protection—from military-grade encryption to real-time fraud detection. All user funds are segregated, and private keys never leave hardware security modules.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-gray-900">
            {/* Real-time rates floating ticker header */}
            <PriceTicker />

            <Navbar />

            {/* Notification framework alerts */}
            <Toaster position="bottom-right" reverseOrder={false} />

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

            <footer className="border-t border-gray-200 bg-white py-6 mt-12">
              <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <p className="text-xs text-gray-400 font-sans tracking-wide">
                  &copy; 2026 SmartSwap Corp. All rights reserved. Created and optimized by Oluwaseun Asekoni Johnson
                </p>
              </div>
            </footer>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
