import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { saveWhatsAppConfig } from "../controllers/whatsapp.config.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  saveWhatsAppConfig
);

export default router;