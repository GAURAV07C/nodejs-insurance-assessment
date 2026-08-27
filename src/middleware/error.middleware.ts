import { Request, Response, NextFunction } from "express";

import { logger } from "../config/logger";

interface HttpError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode =
    typeof (error as HttpError).statusCode === "number"
      ? (error as HttpError).statusCode!
      : 500;

  const message =
    error instanceof Error ? error.message : "Internal server error";

  logger.error({ err: error, statusCode }, "Request failed");

  res.status(statusCode).json({
    success: false,
    message,
  });
};
