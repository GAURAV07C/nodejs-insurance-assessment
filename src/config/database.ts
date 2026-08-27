import mongoose from "mongoose";
import { logger } from "./logger";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");

    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error({ err: error }, "MongoDB disconnect failed");
  }
};
