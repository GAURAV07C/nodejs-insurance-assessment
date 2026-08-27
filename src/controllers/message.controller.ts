import { Request, Response } from "express";

import {
  scheduleMessage,
  getScheduledMessages,
  cancelScheduledMessage,
} from "../services/message.service";
import { logger } from "../config/logger";

export const createScheduledMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Schedule message request received");
    const { message, day, time } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "message is required",
      });

      return;
    }

    if (typeof day !== "string" || !day.trim()) {
      res.status(400).json({
        success: false,
        message: "day is required",
      });

      return;
    }

    if (typeof time !== "string" || !time.trim()) {
      res.status(400).json({
        success: false,
        message: "time is required",
      });

      return;
    }

    const scheduledMessage = await scheduleMessage({
      message: message.trim(),
      day: day.trim(),
      time: time.trim(),
    });

    logger.info({ id: scheduledMessage._id }, "Message scheduled successfully");
    res.status(201).json({
      success: true,
      message: "Message scheduled successfully",

      data: {
        id: scheduledMessage._id,
        message: scheduledMessage.message,

        scheduledAt: scheduledMessage.scheduledAt,

        status: scheduledMessage.status,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Schedule message error");

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to schedule message",
    });
  }
};

export const listScheduledMessages = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Fetch scheduled messages request received");
    const messages = await getScheduledMessages();

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch scheduled messages");

    res.status(500).json({
      success: false,
      message: "Failed to fetch scheduled messages",
    });
  }
};

export const cancelMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);

    logger.info({ id }, "Cancel scheduled message request received");
    const message = await cancelScheduledMessage(id);

    res.status(200).json({
      success: true,
      message: "Scheduled message cancelled",

      data: message,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to cancel message");

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to cancel message",
    });
  }
};
