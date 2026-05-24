import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Hourglass, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, skip auth screens
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back to SmartSwap!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: "user" | "admin") => {
    const defaultEmail = role === "admin" ? "admin@smartswap.com" : "user@smartswap.com";
    const defaultPass = role === "admin" ? "adminpassword" : "userpassword";

    setIsSubmitting(true);
    try {
      await login(defaultEmail, defaultPass);
      toast.success(`Logged in safely as Demo ${role}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Demo login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xl sm:p-8">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-3 shadow shadow-blue-50">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-gray-900">Sign in to SmartSwap</h2>
          <p className="mt-1.5 text-xs text-gray-500 font-medium">
            Manage real-time crypto-fiat swap transactions
          </p>
        </div>

        {/* Regular login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 font-semibold text-white tracking-wide hover:bg-blue-700 transition active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Hourglass className="h-4 w-4 animate-spin" />
                <span>Decrypting profiles...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Not registered yet?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition">
            Create an account
          </Link>
        </p>

        {/* MOCK ACCOUNTS LAUNCH PAD */}
        <div className="mt-8 pt-6 border-t border-gray-150">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center mb-3">
            Sandbox Demo Accounts (Quick Sign-In)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("user")}
              disabled={isSubmitting}
              type="button"
              className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-150 transition text-xs font-bold text-gray-700 flex items-center justify-center space-x-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Demo Customer</span>
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              disabled={isSubmitting}
              type="button"
              className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl hover:bg-amber-50 hover:border-amber-150 transition text-xs font-bold text-gray-700 flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Demo Admin</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2.5 leading-relaxed">
            Quick-sign skips registrations. Customer balance sheet is pre-configured with active cryptos and USD, EUR, GBP fiat for swapping.
          </p>
        </div>

      </div>
    </div>
  );
}
