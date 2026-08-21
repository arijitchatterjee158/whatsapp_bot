import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:3000";

export function connectSocket(): Socket {
  /*
   * IMPORTANT:
   *
   * Return the existing socket even if it is
   * still connecting.
   *
   * This prevents React Strict Mode from
   * creating multiple Socket.IO connections.
   */
  if (socket) {
    return socket;
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  if (!token) {
    console.error(
      "Socket.IO: accessToken not found in localStorage"
    );

    throw new Error(
      "Socket authentication token not found"
    );
  }

  console.log(
    "Connecting Socket.IO to:",
    SOCKET_URL
  );

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },

    transports: [
      "websocket",
      "polling",
    ],

    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log(
      "Frontend Socket.IO connected:",
      socket?.id
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "Frontend Socket.IO connection error:",
      error.message
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "Frontend Socket.IO disconnected:",
      reason
    );
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}