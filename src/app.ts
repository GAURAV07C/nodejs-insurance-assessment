import express, { type Express } from "express";
import { logger } from "./config/logger";
import { setupSwagger } from "./config/swagger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the server.
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
app.get("/health", (_req, res) => {
  logger.info("Health check requested");
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

export default app;
