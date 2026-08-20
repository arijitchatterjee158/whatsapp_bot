import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { WhatsAppConfig } from "../models/whatsapp-config.model";

export async function saveWhatsAppConfig(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const {
      wabaId,
      phoneNumberId,
      businessPhoneNumber,
    } = req.body;

    if (
      !wabaId ||
      !phoneNumberId ||
      !businessPhoneNumber
    ) {
      res.status(400).json({
        success: false,
        message:
          "wabaId, phoneNumberId and businessPhoneNumber are required",
      });
      return;
    }

    const config = await WhatsAppConfig.findOneAndUpdate(
      {
        userId: req.user.userId,
      },
      {
        userId: req.user.userId,
        wabaId,
        phoneNumberId,
        businessPhoneNumber,
        accessToken: "ENV_TOKEN",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "WhatsApp configuration saved",
      config: {
        id: config._id,
        wabaId: config.wabaId,
        phoneNumberId: config.phoneNumberId,
        businessPhoneNumber: config.businessPhoneNumber,
      },
    });
  } catch (error) {
    console.error("Save WhatsApp config error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save WhatsApp configuration",
    });
  }
}