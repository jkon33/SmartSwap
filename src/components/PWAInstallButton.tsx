import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        id="pwa-install-btn"
        className={className || "flex items-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/60 px-3 py-1.5 text-xs font-rajdhani font-bold text-[#00F0FF] hover:bg-cyan-500/30 transition"}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          id="pwa-ios-install-btn"
          className={className || "flex items-center gap-1.5 rounded-xl bg-[#0A0E1A] border border-cyan-500/30 px-2.5 py-1.5 text-xs font-rajdhani font-bold text-slate-300 hover:text-white"}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-2xl cyber-card p-6 shadow-2xl text-xs text-slate-200">
              <h3 className="text-base font-orbitron font-bold text-white mb-2">Install SmartSwap on iOS</h3>
              <p className="text-slate-400 mb-4 leading-relaxed font-mono">
                1. Tap the <strong>Share</strong> button in the Safari toolbar at the bottom.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl btn-neon-cyan py-2 font-orbitron font-bold text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
