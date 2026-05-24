import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { Price } from "../types";
import { api } from "../services/api";

interface SocketContextType {
  prices: Price[];
  connected: boolean;
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Price[]>([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 1. Load initial prices immediately via REST endpoint
    api.swap.getPrices()
      .then((initialPrices) => {
        if (initialPrices && initialPrices.length > 0) {
          setPrices(initialPrices);
        }
      })
      .catch((err) => {
        console.error("Failed to retrieve initial rates via HTTP:", err);
      });

    // Determine the socket server origin dynamically (fallback to Render if hosted on Vercel)
    const getSocketOrigin = () => {
      const envSocketUrl = (import.meta as any).env.VITE_SOCKET_URL;
      if (envSocketUrl) {
        return envSocketUrl;
      }
      if (typeof window !== "undefined") {
        const host = window.location.hostname;
        if (host.includes("vercel.app") || host.includes("vercel")) {
          return "https://smartswap-xui6.onrender.com";
        }
      }
      return window.location.origin;
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
