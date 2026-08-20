import mongoose, { Document, Schema } from "mongoose";

export interface IWhatsAppConfig extends Document {
  userId: mongoose.Types.ObjectId;
  wabaId: string;
  phoneNumberId: string;
  businessPhoneNumber: string;
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IWhatsAppConfig>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    wabaId: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumberId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    businessPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    accessToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const WhatsAppConfig =
  mongoose.model<IWhatsAppConfig>("WhatsAppConfig", schema);