import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  status: "open" | "closed";
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

schema.index(
  { userId: 1, contactId: 1 },
  { unique: true }
);

export const Conversation =
  mongoose.model<IConversation>(
    "Conversation",
    schema
  );