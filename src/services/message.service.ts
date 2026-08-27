import { ScheduledMessage } from "../models/ScheduledMessage";

import { Message } from "../models/Message";

import { messageScheduler } from "./message-scheduler.service";
import { logger } from "../config/logger";

interface ScheduleMessageInput {
  message: string;
  day: string;
  time: string;
}

export const scheduleMessage = async (input: ScheduleMessageInput) => {
  const { message, day, time } = input;

  logger.info({ day, time }, "Scheduling message");

  const scheduledAt = new Date(`${day}T${time}:00`);

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Invalid day or time");
  }

  if (scheduledAt.getTime() <= Date.now()) {
    throw new Error("Scheduled time must be in the future");
  }

  const scheduledMessage = await ScheduledMessage.create({
    message,
    scheduledAt,
    status: "scheduled",
  });

  messageScheduler.scheduleMessage(
    scheduledMessage._id.toString(),
    scheduledAt,
  );

  logger.info({ id: scheduledMessage._id }, "Message scheduled");
  return scheduledMessage;
};

export const getScheduledMessages = async () => {
  logger.info("Fetching scheduled messages");
  return ScheduledMessage.find()
    .sort({
      scheduledAt: 1,
    })
    .lean();
};

export const cancelScheduledMessage = async (messageId: string) => {
  logger.info({ messageId }, "Cancelling scheduled message");
  const scheduledMessage = await ScheduledMessage.findById(messageId);

  if (!scheduledMessage) {
    throw new Error("Scheduled message not found");
  }

  if (scheduledMessage.status !== "scheduled") {
    throw new Error("Only scheduled messages can be cancelled");
  }

  const cancelled = messageScheduler.cancelMessage(messageId);

  if (!cancelled) {
    throw new Error("Scheduled job not found");
  }

  scheduledMessage.status = "cancelled";

  await scheduledMessage.save();

  logger.info({ messageId }, "Scheduled message cancelled");
  return scheduledMessage;
};
