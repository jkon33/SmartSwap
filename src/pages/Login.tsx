import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Hourglass, ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.success("Identity authenticated on quantum node!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: "user" | "admin") => {
    const defaultEmail = role === "admin" ? "oluzeun21@gmail.com" : "user@smartswap.com";
    const defaultPass = role === "admin" ? "adminpassword" : "userpassword";

    setIsSubmitting(true);
    try {
      await login(defaultEmail, defaultPass);
      toast.success(`Connected safely as Demo ${role}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Demo login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 relative z-10 animate-fade-in">
      <div className="cyber-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <span className="corner-bracket-tl" />
        <span className="corner-bracket-tr" />
        <span className="corner-bracket-bl" />
        <span className="corner-bracket-br" />

        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/80 border border-cyan-400 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <KeyRound className="h-6 w-6 text-[#00F0FF] drop-shadow-[0_0_6px_#00F0FF]" />
          </div>
          <h2 className="font-orbitron text-2xl font-black tracking-wide text-white">
            SIGN IN <span className="text-[#00F0FF] glow-text-cyan">NODE</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-mono">
            Authorize cryptographic session for liquidity terminal
          </p>
        </div>

        {/* Regular login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cyan-500/30 bg-[#05060A] text-sm text-white font-mono placeholder-slate-600 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] focus:outline-none"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
              Security Key / Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cyan-500/30 bg-[#05060A] text-sm text-white font-mono placeholder-slate-600 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] focus:outline-none"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl btn-neon-cyan font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Hourglass className="h-4 w-4 animate-spin" />
                <span>DECRYPTING KEYS...</span>
              </>
            ) : (
              <span>AUTHENTICATE NODE</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 font-mono">
          New node operator?{" "}
          <Link to="/register" className="font-bold text-[#00F0FF] hover:underline">
            Register Account
          </Link>
        </p>

        {/* MOCK ACCOUNTS LAUNCH PAD */}
        <div className="mt-8 pt-6 border-t border-cyan-500/20">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block text-center mb-3">
            SANDBOX PRE-SEEDED TEST PROFILES
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("user")}
              disabled={isSubmitting}
              type="button"
              className="px-3 py-2 border border-cyan-500/40 bg-[#05060A] rounded-xl hover:bg-cyan-500/10 hover:border-cyan-400 transition text-xs font-mono font-bold text-cyan-300 flex items-center justify-center space-x-1.5 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>Demo Customer</span>
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              disabled={isSubmitting}
              type="button"
              className="px-3 py-2 border border-[#FFB800]/40 bg-[#05060A] rounded-xl hover:bg-amber-500/10 hover:border-[#FFB800] transition text-xs font-mono font-bold text-[#FFB800] flex items-center justify-center space-x-1.5 shadow-[0_0_8px_rgba(255,184,0,0.2)]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#FFB800]" />
              <span>Demo Admin</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-mono leading-relaxed">
            One-click sign in pre-loads simulated BTC, ETH, SOL, USDT, USD, EUR, and GBP reserves.
          </p>
        </div>

      </div>
    </div>
  );
}
