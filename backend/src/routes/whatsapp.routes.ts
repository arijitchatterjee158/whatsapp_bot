import { Router } from "express";

import { testMessage } from "../controllers/whatsapp.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/test-message",
  authenticate,
  testMessage
);

export default router;