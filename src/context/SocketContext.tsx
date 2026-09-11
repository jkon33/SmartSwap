import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { Capacitor } from "@capacitor/core";
import { Price } from "../types";
import { api } from "../services/api";

interface SocketContextType {
  prices: Price[];
  connected: boolean;
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const INITIAL_DEFAULT_PRICES: Price[] = [
  { currencyPair: "BTC/USD", rate: 76925.21, lastUpdated: new Date().toISOString() },
  { currencyPair: "ETH/USD", rate: 2467.22, lastUpdated: new Date().toISOString() },
  { currencyPair: "SOL/USD", rate: 100.13, lastUpdated: new Date().toISOString() },
  { currencyPair: "USDT/USD", rate: 1.0, lastUpdated: new Date().toISOString() },
  { currencyPair: "USD/EUR", rate: 0.8621, lastUpdated: new Date().toISOString() },
  { currencyPair: "USD/GBP", rate: 0.7403, lastUpdated: new Date().toISOString() },
];

export function SocketProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Price[]>(INITIAL_DEFAULT_PRICES);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Load initial prices immediately via REST endpoint with auto-retry
    const loadPrices = async (attempt = 1) => {
      try {
        const initialPrices = await api.swap.getPrices();
        if (isMounted && Array.isArray(initialPrices) && initialPrices.length > 0) {
          setPrices(initialPrices);
        }
      } catch {
        if (attempt <= 3 && isMounted) {
          setTimeout(() => loadPrices(attempt + 1), 1500 * attempt);
        }
      }
    };

    loadPrices();

    // Determine the socket server origin dynamically
    const getSocketOrigin = () => {
      // 1. Check for custom backend override in localStorage first
      if (typeof window !== "undefined") {
        const savedUrl = localStorage.getItem("smartswap_backend_url");
        if (savedUrl) {
          if (savedUrl.includes("ais-pre-p632kafgq6545hshnzdulb")) {
            localStorage.removeItem("smartswap_backend_url");
          } else {
            return savedUrl.trim().replace(/\/api\/?$/, "").replace(/\/+$/, "");
          }
        }
      }

      // 2. Explicitly check Vite env variable if provided
      const envSocketUrl = (import.meta as any).env?.VITE_SOCKET_URL;
      if (envSocketUrl) {
        return envSocketUrl;
      }

      // 3. Fallback only if running natively in compiled mobile container (Capacitor Android / iOS)
      if (typeof window !== "undefined") {
        try {
          const isNativeMobile = Capacitor.isNativePlatform() && Capacitor.getPlatform() !== "web";
          if (isNativeMobile) {
            return "https://ais-dev-p632kafgq6545hshnzdulb-371764684561.europe-west2.run.app";
          }
        } catch {
          // ignore
        }
      }

      // 4. Fallback to current origin for web browsers, AI Studio preview, and localhost
      if (typeof window !== "undefined" && window.location?.origin) {
        return window.location.origin;
      }
      return "";
    };

    // Connects to hosting fullstack express server dynamically
    const socketInstance = io(getSocketOrigin(), {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
    });

    socketInstance.on("connect", () => {
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.on("price_update", (updatedPrices: Price[]) => {
      setPrices(updatedPrices);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ prices, connected, socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketPrices() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocketPrices must be used inside a SocketProvider");
  }
  return context;
}
