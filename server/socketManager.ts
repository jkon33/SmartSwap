import { Server } from "socket.io";
import { registerPriceBroadcast } from "./priceService";
import { dbStore } from "./dbStore";
import { isAllowedOrigin } from "./security";

export function initSocketManager(server: any) {
  const io = new Server(server, {
    cors: {
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || isAllowedOrigin(requestOrigin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS Security Block: WebSocket cross-origin connection denied."), false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
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
