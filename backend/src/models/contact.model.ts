import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  phone: string;
  name: string;
  whatsappUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IContact>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    whatsappUserId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

schema.index(
  { userId: 1, phone: 1 },
  { unique: true }
);

export const Contact =
  mongoose.model<IContact>("Contact", schema);