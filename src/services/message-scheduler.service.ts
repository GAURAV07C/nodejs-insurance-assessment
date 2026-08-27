import schedule, { Job } from "node-schedule";
import { ScheduledMessage } from "../models/ScheduledMessage";
import { Message } from "../models/Message";
import { logger } from "../config/logger";

class MessageSchedulerService {
  private jobs = new Map<string, Job>();

  public scheduleMessage(messageId: string, scheduledAt: Date): void {
    const job = schedule.scheduleJob(scheduledAt, async () => {
      await this.processMessage(messageId);
    });

    if (!job) {
      throw new Error("Failed to schedule message");
    }

    this.jobs.set(messageId, job);

    logger.info(
      { messageId, scheduledAt: scheduledAt.toISOString() },
      "Message scheduled",
    );
  }

  private async processMessage(messageId: string): Promise<void> {
    try {
      const scheduledMessage = await ScheduledMessage.findById(messageId);

      if (!scheduledMessage) {
        logger.error({ messageId }, "Scheduled message not found");

        return;
      }

      if (scheduledMessage.status !== "scheduled") {
        return;
      }

      /*
       * Actual message is inserted
       * into Message collection
       * at the scheduled time.
       */

      await Message.create({
        message: scheduledMessage.message,

        scheduledAt: scheduledMessage.scheduledAt,

        status: "completed",

        processedAt: new Date(),
      });

      scheduledMessage.status = "completed";

      scheduledMessage.processedAt = new Date();

      await scheduledMessage.save();

      this.jobs.delete(messageId);

      logger.info({ messageId }, "Message inserted successfully");
    } catch (error) {
      logger.error({ err: error, messageId }, "Failed to process message");

      await ScheduledMessage.findByIdAndUpdate(messageId, {
        $set: {
          status: "failed",

          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      this.jobs.delete(messageId);
    }
  }

  public async start(): Promise<void> {
    const scheduledMessages = await ScheduledMessage.find({
      status: "scheduled",
    }).lean();

    const now = Date.now();

    for (const message of scheduledMessages) {
      if (message.scheduledAt.getTime() <= now) {
        /*
         * Past-due message: process it immediately
         * so it is not silently lost after a restart.
         */

        void this.processMessage(message._id.toString());

        continue;
      }

      this.scheduleMessage(message._id.toString(), message.scheduledAt);
    }

    logger.info(
      { count: scheduledMessages.length },
      "Rehydrated scheduled messages",
    );
  }

  public cancelMessage(messageId: string): boolean {
    const job = this.jobs.get(messageId);

    if (!job) {
      return false;
    }

    job.cancel();

    this.jobs.delete(messageId);

    return true;
  }

  public cancelAll(): void {
    for (const job of this.jobs.values()) {
      job.cancel();
    }

    this.jobs.clear();
  }
}

export const messageScheduler = new MessageSchedulerService();
