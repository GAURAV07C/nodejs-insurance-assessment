import { Request, Response, NextFunction } from "express";

export const validateScheduleMessage = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { message, day, time } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({
      success: false,
      message: "message is required",
    });

    return;
  }

  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    res.status(400).json({
      success: false,
      message: "day must be in YYYY-MM-DD format",
    });

    return;
  }

  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({
      success: false,
      message: "time must be in HH:mm format",
    });

    return;
  }

  next();
};
