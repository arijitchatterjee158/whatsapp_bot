import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  if (!token) {
    throw new Error("Authentication token not found");
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log(
      "Socket.IO connected:",
      socket?.id
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "Socket.IO connection error:",
      error.message
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "Socket.IO disconnected:",
      reason
    );
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}