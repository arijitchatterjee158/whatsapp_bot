import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { sendTextMessage } from "../services/whatsapp.service";


export async function getConversations(
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

    const conversations =
      await Conversation.find({
        userId: req.user.userId,
      })
        .populate({
          path: "contactId",
          select: "name phone whatsappUserId",
        })
        .sort({
          lastMessageAt: -1,
          updatedAt: -1,
        });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
}

export async function getConversationMessages(
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

    const { conversationId } = req.params;

    if (!conversationId) {
      res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
      return;
    }

    // First verify that this conversation
    // belongs to the logged-in user.
    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        userId: req.user.userId,
      });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    const messages = await Message.find({
      conversationId: conversation._id,
      userId: req.user.userId,
    }).sort({
      timestamp: 1,
    });

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      messages,
    });
  } catch (error) {
    console.error(
      "Get conversation messages error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
}

export async function sendConversationMessage(
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

    const { conversationId } = req.params;
    const { message } = req.body;

    if (!conversationId) {
      res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "Message is required",
      });
      return;
    }

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        userId: req.user.userId,
      }).populate({
        path: "contactId",
        select: "name phone whatsappUserId",
      });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    const contact = conversation.contactId as any;

    if (!contact?.phone) {
      res.status(400).json({
        success: false,
        message: "Contact phone number not found",
      });
      return;
    }

    // Send message through Meta WhatsApp API
    const result = await sendTextMessage(
      contact.phone,
      message
    );

    const whatsappMessageId =
      result?.messages?.[0]?.id;

    // Save outbound message
    const savedMessage = await Message.create({
      userId: req.user.userId,
      conversationId: conversation._id,
      whatsappMessageId,
      direction: "outbound",
      type: "text",
      text: message.trim(),
      timestamp: new Date(),
      status: "sent",
    });

    // Update conversation preview
    conversation.lastMessage = message.trim();
    conversation.lastMessageAt = new Date();

    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: {
        whatsappMessageId,
        message: savedMessage,
      },
    });
  } catch (error: any) {
    console.error(
      "Send conversation message error:",
      error?.response?.data || error
    );

    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error:
        error?.response?.data ||
        error?.message,
    });
  }
}