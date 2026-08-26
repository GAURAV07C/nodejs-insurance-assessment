import { Schema, model, Document } from "mongoose";

export type MessageStatus = "scheduled" | "completed" | "failed";

export interface IMessage extends Document {
  message: string;
  scheduledAt: Date;
  status: MessageStatus;
  processedAt?: Date;
  error?: string;
}

const messageSchema = new Schema<IMessage>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "failed"],
      default: "scheduled",
      index: true,
    },

    processedAt: {
      type: Date,
    },

    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ scheduledAt: 1 });

export const Message = model<IMessage>("Message", messageSchema);
