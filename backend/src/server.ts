import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";

import authRoutes from "./routes/auth.routes";
import whatsappRoutes from "./routes/whatsapp.routes";
import whatsappWebhookRoutes from "./routes/whatsapp.webhook.routes";
import whatsappConfigRoutes from "./routes/whatsapp.config.routes";
import conversationRoutes from "./routes/conversation.routes";

import { initializeSocket } from "./socket/socket.server";

const app = express();

/**
 * Middlewares
 */
app.use(helmet());
app.use(cors());
app.use(express.json());

/**
 * REST API Routes
 */
app.use("/api/auth", authRoutes);

app.use(
  "/api/whatsapp",
  whatsappRoutes
);

app.use(
  "/api/webhooks/whatsapp",
  whatsappWebhookRoutes
);

app.use(
  "/api/whatsapp/config",
  whatsappConfigRoutes
);

app.use(
  "/api/whatsapp/conversations",
  conversationRoutes
);

/**
 * Health Check
 */
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "WhatsApp MVP backend is running",
    environment: env.nodeEnv,
  });
});

/**
 * HTTP Server
 *
 * Socket.IO must be attached to the HTTP server
 * instead of using app.listen().
 */
const httpServer = createServer(app);

/**
 * Socket.IO
 */
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

/**
 * Initialize Socket.IO event handling
 */
initializeSocket(io);

/**
 * Start Server
 */
async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    await connectRedis();

    httpServer.listen(env.port, () => {
      console.log(
        `Server running on http://localhost:${env.port}`
      );

      console.log(
        "Socket.IO server is running"
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();