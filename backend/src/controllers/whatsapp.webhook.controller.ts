import { Request, Response } from "express";

import { env } from "../config/env";
import { processWhatsAppWebhook } from "../services/whatsapp.webhook.service";

export function verifyWebhook(
  req: Request,
  res: Response
): void {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === env.meta.verifyToken
  ) {
    console.log("WhatsApp webhook verified");

    res.status(200).send(challenge);
    return;
  }

  console.error(
    "WhatsApp webhook verification failed"
  );

  res.sendStatus(403);
}

export async function receiveWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log(
      "========== WhatsApp Webhook =========="
    );

    console.log(
      JSON.stringify(req.body, null, 2)
    );

    console.log(
      "======================================="
    );

    // Respond to Meta immediately.
    res.sendStatus(200);

    // Process and save the incoming message.
    await processWhatsAppWebhook(req.body);
  } catch (error) {
    console.error(
      "WhatsApp webhook processing error:",
      error
    );
  }
}