import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Mail, Send, CheckCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function EmailVerification() {
  const { user, verifyEmail, resendVerification, logout } = useAuth();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      await verifyEmail(user?.email || "", code);
      toast.success("Email verified successfully! Welcome to SmartSwap.");
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired code.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await resendVerification(user?.email || "");
      toast.success("A fresh verification code is sent to your email.");
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-150 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-blue-600 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-blue-500 opacity-20 rounded-full" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-700 opacity-25 rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-md">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-sans tracking-tight">Verify Your Email</h2>
            <p className="text-xs text-blue-100 font-mono font-medium max-w-xs">
              Account: {user?.email}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-500 text-center leading-relaxed font-sans">
            We have sent a verification email to <strong className="text-gray-900">{user?.email}</strong>. 
            Kindly extract the 6-digit OTP code or click the verification link in the mail.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp-code" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">
                6-Digit Verification Code
              </label>
              <input
                id="otp-code"
                type="text"
                placeholder="••••••"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-[1em] text-2xl font-bold font-mono py-3 border-2 border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 uppercase placeholder-gray-350"
              />
            </div>

            <button
              type="submit"
              disabled={verifying || code.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl py-3 text-sm font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
            >
              {verifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify and Activate Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between w-full text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 font-semibold transition flex items-center space-x-1.5"
              >
                {resending ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>
                  {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Verification Email"}
                </span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-red-600 hover:text-red-800 font-semibold transition"
              >
                Sign Out
              </button>
            </div>

            {/* Developer Assistive Sandbox Mode Helper */}
            <div className="w-full bg-amber-50 border border-amber-150 rounded-xl p-4 text-xs text-amber-800 space-y-2 leading-relaxed">
              <div className="font-bold flex items-center space-x-1">
                <span>⚡ Sandbox Assistive Mode</span>
              </div>
              <p>
                Email delivery is fully functional in background mode. If you do not have SMTP configured or cannot check your mailbox, check your <strong>applet terminal console logs</strong> to view the compiled email and your <strong>6-digit OTP code</strong>!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
