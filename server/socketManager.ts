import { Server } from "socket.io";
import { registerPriceBroadcast } from "./priceService";
import { dbStore } from "./dbStore";

export function initSocketManager(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Send immediate prices snapshot to newly connected client
    socket.emit("price_update", dbStore.getPrices());

    socket.on("disconnect", () => {
      // Clean up if needed
    });
  });

  // Register the Socket.IO broadcast callback inside priceService
  registerPriceBroadcast((prices) => {
    io.emit("price_update", prices);
  });

  return io;
}
