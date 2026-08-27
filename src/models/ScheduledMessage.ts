import { Schema, model, Document } from "mongoose";

export type ScheduledMessageStatus =
  | "scheduled"
  | "completed"
  | "failed"
  | "cancelled";

export interface IScheduledMessage extends Document {
  message: string;
  scheduledAt: Date;
  status: ScheduledMessageStatus;
  processedAt?: Date;
  error?: string;
}

const scheduledMessageSchema = new Schema<IScheduledMessage>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "failed", "cancelled"],
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

scheduledMessageSchema.index({
  status: 1,
  scheduledAt: 1,
});

export const ScheduledMessage = model<IScheduledMessage>(
  "ScheduledMessage",
  scheduledMessageSchema,
);
