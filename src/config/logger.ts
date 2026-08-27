import pino from "pino";

import { env } from "./env";

const level = env.LOG_LEVEL;

export const logger = pino({
  level,
  ...(env.NODE_ENV === "production"
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
});
