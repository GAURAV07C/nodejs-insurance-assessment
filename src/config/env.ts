import dotenv from "dotenv";

dotenv.config();

type EnvConfig = {
  PORT: number;
  MONGODB_URI: string;
  NODE_ENV: string;
  LOG_LEVEL: string;
  CPU_THRESHOLD: number;
  CPU_MONITOR_INTERVAL: number;
};

/**
 * Variables that MUST be present. The app cannot function
 * (DB connection / core config) without them, so we fail fast.
 */
const REQUIRED_ENV_VARS: Array<keyof EnvConfig> = ["MONGODB_URI"];

const raw = process.env;

const missing = REQUIRED_ENV_VARS.filter((key) => !raw[key]);

if (missing.length > 0) {
  const message = `Missing required environment variable(s): ${missing.join(", ")}. Please set them in your .env file.`;

  console.error(`[env] ERROR: ${message}`);

  throw new Error(message);
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(
      `Invalid environment variable: expected a number but got "${value}".`,
    );
  }

  return parsed;
};

export const env: EnvConfig = {
  PORT: parseNumber(raw.PORT, 5000),
  MONGODB_URI: raw.MONGODB_URI as string,
  NODE_ENV: raw.NODE_ENV ?? "development",
  LOG_LEVEL: raw.LOG_LEVEL ?? "info",
  CPU_THRESHOLD: parseNumber(raw.CPU_THRESHOLD, 70),
  CPU_MONITOR_INTERVAL: parseNumber(raw.CPU_MONITOR_INTERVAL, 5000),
};

export default env;
