import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

import { env } from "../config/env";

interface JwtPayload {
  userId: string;
  email?: string;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

let io: Server | null = null;

export function initializeSocket(
  socketServer: Server
): void {
  io = socketServer;

  /**
   * Socket.IO authentication
   */
  io.use(
    (
      socket: AuthenticatedSocket,
      next
    ) => {
      try {
        const token =
          socket.handshake.auth?.token;

        if (!token) {
          return next(
            new Error(
              "Authentication token required"
            )
          );
        }

        const decoded =
          jwt.verify(
            token,
            env.jwtSecret
          );

        if (
          typeof decoded !== "object" ||
          decoded === null ||
          !("userId" in decoded)
        ) {
          return next(
            new Error(
              "Invalid authentication token"
            )
          );
        }

        socket.userId = String(
          decoded.userId
        );

        if ("email" in decoded) {
          socket.email = String(
            decoded.email
          );
        }

        next();
      } catch (error) {
        console.error(
          "Socket authentication failed:",
          error
        );

        next(
          new Error(
            "Invalid authentication token"
          )
        );
      }
    }
  );

  /**
   * Socket connection
   */
  io.on(
    "connection",
    (socket: AuthenticatedSocket) => {
      console.log(
        `Socket connected: ${socket.id}`
      );

      /**
       * Join user-specific room
       */
      if (socket.userId) {
        const roomName =
          `user:${socket.userId}`;

        socket.join(roomName);

        console.log(
          `Socket ${socket.id} joined ${roomName}`
        );
      }

      /**
       * Disconnect
       */
      socket.on("disconnect", () => {
        console.log(
          `Socket disconnected: ${socket.id}`
        );
      });
    }
  );
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
}