import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { Price } from "../types";

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
    // Connects to hosting fullstack express server dynamically
    const socketInstance = io(window.location.origin, {
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
