import { parentPort, workerData } from "worker_threads";
import XLSX from "xlsx";

import { logger } from "../config/logger";

interface ParsedRow {
  agent: string | null;
  userType: string | null;
  policy_mode: string | null;
  producer: string | null;
  policy_number: string | null;
  premium_amount_written: number | null;
  premium_amount: number | null;
  policy_type: string | null;
  company_name: string | null;
  category_name: string | null;
  policy_start_date: Date | null;
  policy_end_date: Date | null;
  csr: string | null;
  account_name: string | null;
  email: string | null;
  gender: string | null;
  firstname: string | null;
  city: string | null;
  account_type: string | null;
  phone: string | null;
  address: string | null;
  state: string | null;
  zip: string | null;
  dob: Date | null;
  primary: boolean | null;
  Applicant_ID: string | null;
  agency_id: string | null;
  hasActive_ClientPolicy: boolean | null;
}

const normalizeValue = (value: unknown): string | null => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "NaN"
  ) {
    return null;
  }
  return String(value).trim();
};

const normalizeNumber = (value: unknown): number | null => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "NaN"
  ) {
    return null;
  }
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "NaN"
  ) {
    return null;
  }

  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  return null;
};

const EXCEL_EPOCH = 25569;

const normalizeDateCell = (value: unknown): Date | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    date = new Date((value - EXCEL_EPOCH) * 86400 * 1000);
  } else {
    const str = String(value).trim();

    if (/^\d+(\.\d+)?$/.test(str)) {
      date = new Date((Number(str) - EXCEL_EPOCH) * 86400 * 1000);
    } else {
      date = new Date(str);
    }
  }

  return Number.isNaN(date.getTime()) ? null : date;
};

try {
  logger.info({ filePath: workerData.filePath }, "Worker started processing file");

  const workbook = XLSX.readFile(workerData.filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No worksheet found in the Excel file.");
  }

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: null,
  });

  logger.info({ rowCount: rows.length }, "Parsed rows from worksheet");

  const normalizedRows: ParsedRow[] = rows.map((row) => ({
    agent: normalizeValue(row.agent),
    userType: normalizeValue(row.userType),
    policy_mode: normalizeValue(row.policy_mode),
    producer: normalizeValue(row.producer),

    policy_number: normalizeValue(row.policy_number),
    premium_amount_written: normalizeNumber(row.premium_amount_written),
    premium_amount: normalizeNumber(row.premium_amount),

    policy_type: normalizeValue(row.policy_type),
    company_name: normalizeValue(row.company_name),
    category_name: normalizeValue(row.category_name),

    policy_start_date: normalizeDateCell(row.policy_start_date),
    policy_end_date: normalizeDateCell(row.policy_end_date),
    csr: normalizeValue(row.csr),
    account_name: normalizeValue(row.account_name),
    email: normalizeValue(row.email),

    gender: normalizeValue(row.gender),
    firstname: normalizeValue(row.firstname),
    city: normalizeValue(row.city),
    account_type: normalizeValue(row.account_type),
    phone: normalizeValue(row.phone),
    address: normalizeValue(row.address),
    state: normalizeValue(row.state),
    zip: normalizeValue(row.zip),
    dob: normalizeDateCell(row.dob),
    primary: normalizeBoolean(row.primary),
    Applicant_ID: normalizeValue(row["Applicant ID"]),
    agency_id: normalizeValue(row.agency_id),
    hasActive_ClientPolicy: normalizeBoolean(row["hasActive ClientPolicy"]),
  }));

  logger.info({ totalRows: normalizedRows.length }, "Worker finished processing file");

  parentPort?.postMessage({
    success: true,
    data: normalizedRows,
    totalRows: normalizedRows.length,
  });
} catch (error) {
  logger.error({ error }, "Worker failed to process file");
  parentPort?.postMessage({
    success: false,
    error: error instanceof Error ? error.message : "Failed to process file",
  });
}
