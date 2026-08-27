import { Request, Response } from "express";

import { searchPoliciesByUsername } from "../services/policy.service";
import { logger } from "../config/logger";

export const searchPolicies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const username = String(req.query.username ?? "").trim();

    logger.info({ username }, "Policy search requested");

    if (!username) {
      logger.warn("Policy search rejected: missing username");
      res.status(400).json({
        success: false,
        message: "username query parameter is required",
      });

      return;
    }

    const policies = await searchPoliciesByUsername(username);

    if (!policies.length) {
      logger.info({ username }, "No policies found for username");
      res.status(404).json({
        success: false,
        message: "No policies found for the given username",
        data: [],
      });

      return;
    }

    logger.info({ username, count: policies.length }, "Policy search completed");
    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    logger.error({ err: error }, "Policy search error");

    res.status(500).json({
      success: false,
      message: "Failed to search policies",
    });
  }
};
