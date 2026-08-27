import app from "./app";
import { connectDatabase,disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { cpuMonitor } from "./services/cpu-monitor.service";
import { messageScheduler } from "./services/message-scheduler.service";

const PORT = env.PORT;

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

    await messageScheduler.start();

    /*
     * Graceful shutdown
     */

    const shutdown = async (
      signal: string
    ) => {
      logger.info(`${signal} received. Shutting down...`);

      cpuMonitor.stop();

      messageScheduler.cancelAll();

      server.close(async () => {
        logger.info("HTTP server closed.");

        await disconnectDatabase()

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

