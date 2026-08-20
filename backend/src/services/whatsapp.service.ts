import { metaClient } from "../whatsapp/meta.client";
import { env } from "../config/env";

export async function sendTestMessage(to: string) {
  const normalizedPhone = to.replace(/\D/g, "");

  if (!normalizedPhone) {
    throw new Error("Invalid recipient phone number");
  }

  const result = await metaClient.sendTemplateMessage(
    normalizedPhone,
    env.whatsapp.templateName,
    env.whatsapp.templateLanguage
  );

  return result;
}

export async function sendTextMessage(
  to: string,
  message: string
) {
  const normalizedPhone = to.replace(/\D/g, "");

  if (!normalizedPhone) {
    throw new Error("Invalid recipient phone number");
  }

  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  const result = await metaClient.sendTextMessage(
    normalizedPhone,
    message.trim()
  );

  return result;
}