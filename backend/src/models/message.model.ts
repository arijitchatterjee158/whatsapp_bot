import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  whatsappMessageId: string;
  direction: "inbound" | "outbound";
  type: string;
  text?: string;
  timestamp: Date;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    whatsappMessageId: {
      type: String,
      required: true,
      unique: true,
    },

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    text: {
      type: String,
    },

    timestamp: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({
  conversationId: 1,
  timestamp: 1,
});

export const Message =
  mongoose.model<IMessage>("Message", schema);