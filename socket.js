import { io } from "socket.io-client";

export const socket = io("https://poll-backend-tte0.onrender.com", {
  transports: ["websocket"],
});