import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";
import { logger } from "./config/logger";
import { cpuMonitor } from "./services/cpu-monitor.service";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

   const server = app.listen(
      PORT,
      () => {
        logger.info(`Server running on port ${PORT}`);
      }
    );

    cpuMonitor.start();

    /*
     * Graceful shutdown
     */

    const shutdown = async (
      signal: string
    ) => {
      logger.info(`${signal} received. Shutting down...`);

      cpuMonitor.stop();

      server.close(() => {
        logger.info("HTTP server closed.");

        process.exit(0);
      });
    };

    process.on(
      "SIGTERM",
      () => {
        void shutdown("SIGTERM");
      }
    );

    process.on(
      "SIGINT",
      () => {
        void shutdown("SIGINT");
      }
    );
  } catch (err) {
    logger.error({ err }, "Failed to start server:");

    process.exit(1);
  }
};

void startServer();

