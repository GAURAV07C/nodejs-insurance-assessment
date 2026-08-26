import mongoose from "mongoose";
import { logger } from "./logger";

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.warn("MONGODB_URI is not defined - database connection skipped");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");
  }
};
