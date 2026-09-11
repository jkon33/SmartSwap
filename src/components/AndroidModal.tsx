import React, { useState } from "react";
import { Smartphone, Check, Copy, Download, Server, Globe, Terminal, X, ArrowRight } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import toast from "react-hot-toast";

interface AndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidModal: React.FC<AndroidModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<"instant" | "apk" | "backend">("instant");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Backend URL configuration
  const currentSavedBackend = localStorage.getItem("smartswap_backend_url") || "";
  const [backendInput, setBackendInput] = useState(
    currentSavedBackend || "https://ais-pre-p632kafgq6545hshnzdulb-371764684561.europe-west2.run.app"
  );
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveBackend = async () => {
    const clean = backendInput.trim().replace(/\/+$/, "");
    if (!clean) {
      localStorage.removeItem("smartswap_backend_url");
      toast.success("Backend URL reset to default!");
      setTimeout(() => window.location.reload(), 600);
      return;
    }

    setIsTesting(true);
    try {
      const pingUrl = clean.endsWith("/api") ? `${clean}/prices` : `${clean}/api/prices`;
      const res = await fetch(pingUrl, { method: "GET" });
      if (res.ok) {
        localStorage.setItem("smartswap_backend_url", clean);
        toast.success("Backend connection verified & saved!");
        setTimeout(() => window.location.reload(), 700);
      } else {
        localStorage.setItem("smartswap_backend_url", clean);
        toast.success("Backend saved (server returned " + res.status + ")");
        setTimeout(() => window.location.reload(), 700);
      }
    } catch {
      localStorage.setItem("smartswap_backend_url", clean);
      toast.success("Backend URL saved! (Network check timed out)");
      setTimeout(() => window.location.reload(), 700);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="android-build-modal"
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                SmartSwap Android App
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Install directly on your Android phone or build the native APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-150 mt-4 space-x-2">
          <button
            onClick={() => setActiveTab("instant")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === "instant"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            1. Install on Android Phone
          </button>
          <button
            onClick={() => setActiveTab("apk")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === "apk"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            2. Build Native APK (Android Studio / CI)
          </button>
          <button
            onClick={() => setActiveTab("backend")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === "backend"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            3. Backend Server Link
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-5 space-y-4 text-xs text-gray-700">
          {activeTab === "instant" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50 border border-blue-150 p-4">
                <h3 className="font-semibold text-blue-900 text-sm mb-1 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Instant Installation via Android Browser
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  You can install SmartSwap on any Android device directly from Chrome or any Android browser. It runs in full-screen standalone mode with native app performance.
                </p>

                {isInstalled ? (
                  <div className="mt-3 flex items-center gap-2 text-emerald-700 font-semibold bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                    <Check className="h-4 w-4" />
                    App is already installed and running in standalone mode!
                  </div>
                ) : isInstallable ? (
                  <div className="mt-3">
                    <button
                      onClick={install}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                    >
                      <Download className="h-4 w-4" />
                      Install SmartSwap on this Android Device Now
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg bg-white/90 p-3 border border-blue-200 text-blue-950 space-y-1.5">
                    <p className="font-bold">How to install on Android Chrome:</p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-900">
                      <li>Open this URL on your Android phone: <span className="font-mono bg-blue-100/70 px-1 py-0.5 rounded">https://ais-pre-p632kafgq6545hshnzdulb-371764684561.europe-west2.run.app</span></li>
                      <li>Tap the <strong>three dots (⋮)</strong> menu in the top-right corner of Chrome.</li>
                      <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                      <li>SmartSwap will appear on your Android home screen as an installed app!</li>
                    </ol>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70">
                  <span className="font-bold text-gray-900 block mb-1">Package ID</span>
                  <span className="font-mono text-gray-600">com.smartswap.app</span>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70">
                  <span className="font-bold text-gray-900 block mb-1">Supported Android Versions</span>
                  <span className="text-gray-600">Android 7.0+ (API 24 to 36)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "apk" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h4 className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-emerald-700" />
                  Option A: 1-Click APK Build via GitHub Actions (Automated)
                </h4>
                <p className="text-xs text-emerald-800 mb-2">
                  A complete automated CI workflow has been generated in <code className="bg-emerald-100 px-1 rounded font-mono">.github/workflows/android-build.yml</code>.
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] relative">
                  <code>git push origin main</code>
                  <button
                    onClick={() => copyToClipboard("git push origin main", "gh-cmd")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {copiedIndex === "gh-cmd" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700 mt-2">
                  GitHub Actions will compile the Android app and provide the downloadable <span className="font-semibold">SmartSwap-debug.apk</span> directly in your Actions tab!
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  Option B: Build Locally with Android Studio
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  The <code className="bg-gray-200 px-1 rounded font-mono">android/</code> directory is already synchronized with Capacitor. You can open and build it locally anytime:
                </p>

                <div className="space-y-2">
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] flex justify-between items-center">
                    <span>npm run mobile:sync</span>
                    <button
                      onClick={() => copyToClipboard("npm run mobile:sync", "cmd1")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedIndex === "cmd1" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] flex justify-between items-center">
                    <span>npx cap open android</span>
                    <button
                      onClick={() => copyToClipboard("npx cap open android", "cmd2")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedIndex === "cmd2" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] flex justify-between items-center">
                    <span>cd android &amp;&amp; ./gradlew assembleDebug</span>
                    <button
                      onClick={() => copyToClipboard("cd android && ./gradlew assembleDebug", "cmd3")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedIndex === "cmd3" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  The generated APK file will be located at: <br />
                  <span className="font-mono text-gray-700">android/app/build/outputs/apk/debug/app-debug.apk</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === "backend" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-600" />
                  Target API Backend URL for Android
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  When running on Android, the app connects to this server for live price ticks, user login, and swaps:
                </p>

                <div className="space-y-2">
                  <input
                    type="url"
                    value={backendInput}
                    onChange={(e) => setBackendInput(e.target.value)}
                    placeholder="https://your-backend.onrender.com or https://ais-pre-...run.app"
                    className="w-full text-xs font-mono bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveBackend}
                      disabled={isTesting}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5"
                    >
                      {isTesting ? "Testing Connection..." : "Save & Connect Backend"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setBackendInput("https://ais-pre-p632kafgq6545hshnzdulb-371764684561.europe-west2.run.app");
                      }}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold text-xs transition"
                    >
                      Use Cloud Run
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
