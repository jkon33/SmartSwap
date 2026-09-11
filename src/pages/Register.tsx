import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Lock, Mail, User as UserIcon, Hourglass } from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
  const { user, register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
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
    if (!name || !email || !password) {
      toast.error("Please fill in all requested fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters in length.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      toast.success("Account provisioned on liquidity node!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to register account.");
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

        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/80 border border-cyan-400 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <UserPlus className="h-6 w-6 text-[#00F0FF] drop-shadow-[0_0_6px_#00F0FF]" />
          </div>
          <h2 className="font-orbitron text-2xl font-black tracking-wide text-white">
            PROVISION <span className="text-[#00F0FF] glow-text-cyan">NODE</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-mono">
            Deploy your decentralized spot liquidity and fiat gateway account
          </p>
        </div>

        {/* Register state fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
              Operator Identifier / Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <UserIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Warren Buffett"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cyan-500/30 bg-[#05060A] text-sm text-white font-mono placeholder-slate-600 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.4)] focus:outline-none"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
              Secure Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="warren@berkshire.com"
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
              Quantum Key / Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="At least 6 characters"
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
            className="w-full py-3 rounded-xl btn-neon-cyan font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Hourglass className="h-4 w-4 animate-spin" />
                <span>MINTING BLOCKCHAIN KEYS...</span>
              </>
            ) : (
              <span>DEPLOY NEW OPERATOR ACCOUNT</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 font-mono">
          Already registered on SmartSwap?{" "}
          <Link to="/login" className="font-bold text-[#00F0FF] hover:underline">
            Sign In Node
          </Link>
        </p>

      </div>
    </div>
  );
}
