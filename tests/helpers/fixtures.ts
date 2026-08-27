import fs from "fs/promises";
import os from "os";
import path from "path";

/**
 * Returns a future day (YYYY-MM-DD) and time (HH:mm) in local time,
 * guaranteed to be at least `minutesAhead` minutes from now.
 */
export const futureSchedule = (minutesAhead = 60) => {
  const d = new Date(Date.now() + minutesAhead * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    day: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

/**
 * Writes `content` to a temp file and returns the path. Used to feed the
 * multipart `file` field of the upload endpoint via supertest `.attach()`.
 */
export const writeTempFile = async (
  content: string,
  filename = "data.csv",
): Promise<string> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));

  const filePath = path.join(dir, filename);

  await fs.writeFile(filePath, content);

  return filePath;
};

/**
 * A single, self-contained CSV row that exercises every upload branch
 * (agent, user, account, lob, carrier, policy) so a policy is actually
 * inserted. Pass unique values to keep parallel/retry runs isolated.
 */
export const sampleCsv = (overrides: Record<string, string> = {}): string => {
  const base: Record<string, string> = {
    agent: "Agent QA",
    userType: "Insured",
    policy_mode: "Monthly",
    producer: "Producer QA",
    policy_number: "QA-POL-0001",
    premium_amount_written: "1000",
    premium_amount: "950",
    policy_type: "Auto",
    company_name: "Carrier QA",
    category_name: "Health",
    policy_start_date: "2026-01-01",
    policy_end_date: "2026-12-31",
    csr: "csr-qa",
    account_name: "Account QA",
    email: "qa.user@example.com",
    gender: "M",
    firstname: "Qauser",
    city: "Testville",
    account_type: "Personal",
    phone: "1234567890",
    address: "1 QA Street",
    state: "TS",
    zip: "00001",
    dob: "1990-01-01",
  };

  const row = { ...base, ...overrides };
  const header = Object.keys(row).join(",");

  const escape = (v: string) =>
    /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

  const values = Object.values(row).map(escape).join(",");

  return `${header}\n${values}\n`;
};
