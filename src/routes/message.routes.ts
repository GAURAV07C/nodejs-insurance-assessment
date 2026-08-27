import { Router } from "express";

import {
  createScheduledMessage,
  listScheduledMessages,
  cancelMessage,
} from "../controllers/message.controller";
import { validateScheduleMessage } from "../middleware/message.validation";

const router = Router();

/**
 * @openapi
 * /api/messages/schedule:
 *   post:
 *     summary: Schedule a message
 *     description: Schedule a message to be delivered at a future day and time.
 *     tags:
 *       - Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - day
 *               - time
 *             properties:
 *               message:
 *                 type: string
 *               day:
 *                 type: string
 *                 description: Date in YYYY-MM-DD format
 *                 example: "2026-08-28"
 *               time:
 *                 type: string
 *                 description: Time in HH:mm format (24h)
 *                 example: "14:30"
 *     responses:
 *       201:
 *         description: Message scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     message:
 *                       type: string
 *                     scheduledAt:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *       400:
 *         description: Validation error or invalid/future time
 * /api/messages/scheduled:
 *   get:
 *     summary: List scheduled messages
 *     description: Returns all scheduled messages ordered by scheduled time.
 *     tags:
 *       - Messages
 *     responses:
 *       200:
 *         description: List of scheduled messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 * /api/messages/scheduled/{id}:
 *   delete:
 *     summary: Cancel a scheduled message
 *     description: Cancels a scheduled message by its ID.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled message cancelled
 *       400:
 *         description: Message not found or cannot be cancelled
 */
router.post("/schedule", validateScheduleMessage, createScheduledMessage);

router.get("/scheduled", listScheduledMessages);

router.delete("/scheduled/:id", cancelMessage);

export default router;
