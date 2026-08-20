import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import {
  getConversations,
  getConversationMessages,
  sendConversationMessage,
} from "../controllers/conversation.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  getConversations
);

router.get(
  "/:conversationId/messages",
  authenticate,
  getConversationMessages
);

router.post(
  "/:conversationId/messages",
  authenticate,
  sendConversationMessage
);

export default router;