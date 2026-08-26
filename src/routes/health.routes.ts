import {Router} from "express";

import { logger } from "../config/logger";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the server.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get("/health", (_req, res) => {
  logger.info("Health check requested");
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

export default router;
