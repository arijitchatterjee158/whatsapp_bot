import { WhatsAppConfig } from "../models/whatsapp-config.model";
import { Contact } from "../models/contact.model";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";

import { getSocketIO } from "../socket/socket.server";

interface WhatsAppWebhook {
  object?: string;

  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: {
          phone_number_id?: string;
        };

        contacts?: Array<{
          profile?: {
            name?: string;
          };

          wa_id?: string;
          user_id?: string;
        }>;

        messages?: Array<{
          from?: string;
          from_user_id?: string;
          id?: string;
          timestamp?: string;
          type?: string;

          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
}

export async function processWhatsAppWebhook(
  payload: WhatsAppWebhook
): Promise<void> {
  if (
    payload.object !==
    "whatsapp_business_account"
  ) {
    return;
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      if (!value) {
        continue;
      }

      const phoneNumberId =
        value.metadata?.phone_number_id;

      if (!phoneNumberId) {
        continue;
      }

      /**
       * Find which application user owns
       * this WhatsApp phone number.
       */
      const config =
        await WhatsAppConfig.findOne({
          phoneNumberId,
        });

      if (!config) {
        console.warn(
          `No WhatsApp configuration found for phoneNumberId: ${phoneNumberId}`
        );

        continue;
      }

      const userId = config.userId;

      const contacts =
        value.contacts ?? [];

      const messages =
        value.messages ?? [];

      for (const message of messages) {
        if (
          !message.id ||
          !message.from
        ) {
          continue;
        }

        /**
         * MVP:
         * Process text messages only.
         */
        if (message.type !== "text") {
          console.log(
            `Ignoring unsupported message type: ${message.type}`
          );

          continue;
        }

        /**
         * Find contact information
         * provided by Meta.
         */
        const contactInfo =
          contacts.find(
            (contact) =>
              contact.wa_id ===
              message.from
          );

        const contactName =
          contactInfo?.profile?.name ||
          message.from;

        /**
         * Create/update contact.
         */
        const contact =
          await Contact.findOneAndUpdate(
            {
              userId,
              phone: message.from,
            },
            {
              $set: {
                name: contactName,

                whatsappUserId:
                  contactInfo?.user_id ||
                  message.from_user_id,
              },
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );

        /**
         * Create/update conversation.
         */
        const conversation =
          await Conversation.findOneAndUpdate(
            {
              userId,
              contactId: contact._id,
            },
            {
              $set: {
                status: "open",

                lastMessage:
                  message.text?.body ||
                  "",

                lastMessageAt:
                  new Date(
                    Number(
                      message.timestamp
                    ) * 1000
                  ),
              },
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );

        /**
         * Prevent duplicate webhook
         * processing.
         */
        const existingMessage =
          await Message.findOne({
            whatsappMessageId:
              message.id,
          });

        if (existingMessage) {
          continue;
        }

        /**
         * Save incoming message.
         */
        const savedMessage =
          await Message.create({
            userId,

            conversationId:
              conversation._id,

            whatsappMessageId:
              message.id,

            direction: "inbound",

            type: message.type,

            text:
              message.text?.body ||
              "",

            timestamp:
              new Date(
                Number(
                  message.timestamp
                ) * 1000
              ),

            status: "received",
          });

        console.log(
          `Message saved from ${contactName}: ${message.text?.body}`
        );

        /**
         * Send real-time message to the
         * logged-in application user.
         */
        try {
          const io = getSocketIO();

          const roomName =
            `user:${userId}`;

          io.to(roomName).emit(
            "new_message",
            {
              message: savedMessage,
              conversation: {
                _id:
                  conversation._id,

                contactId:
                  contact._id,

                lastMessage:
                  conversation.lastMessage,

                lastMessageAt:
                  conversation.lastMessageAt,

                status:
                  conversation.status,
              },
            }
          );

          console.log(
            `Real-time message emitted to ${roomName}`
          );
        } catch (socketError) {
          /**
           * Socket failure must NOT cause
           * webhook processing to fail.
           *
           * The message is already safely
           * stored in MongoDB.
           */
          console.error(
            "Socket.IO emit error:",
            socketError
          );
        }
      }
    }
  }
}