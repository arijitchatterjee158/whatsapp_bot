import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendTestMessage } from "../services/whatsapp.service";
import { sendTextMessage } from "../services/whatsapp.service";

export async function testMessage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { to } = req.body;

    if (!to) {
      res.status(400).json({
        success: false,
        message: "Recipient phone number is required",
      });

      return;
    }

    const result = await sendTestMessage(to);

    res.json({
      success: true,
      message: "WhatsApp message sent successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "WhatsApp send error:",
      error?.response?.data || error
    );

    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp message",
      error: error?.response?.data || error?.message,
    });
  }
}

