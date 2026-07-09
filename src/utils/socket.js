import { io } from "socket.io-client";
import { BASE_URL } from "./api";

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const token = localStorage.getItem("paxel_token");
  socket = io(BASE_URL, {
    auth: { token },
    autoConnect: false,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


