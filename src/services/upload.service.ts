import { Worker } from "worker_threads";

import path from "path";

import { Agent } from "../models/Agent";
import { User } from "../models/User";
import { UserAccount } from "../models/UserAccount";
import { LOB } from "../models/LOB";
import { Carrier } from "../models/Carrier";
import { Policy } from "../models/Policy";

import { logger } from "../config/logger";

interface WorkerSuccess {
  success: true;
  data: Record<string, unknown>[];
  totalRows: number;
}

interface WorkerFailure {
  success: false;
  error: string;
}

type WorkerResponse = WorkerSuccess | WorkerFailure;

const runWorker = (filePath: string): Promise<WorkerSuccess> => {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, "../workers/upload.worker.js");

    logger.info({ workerPath, filePath }, "Spawning upload worker");

    const worker = new Worker(workerPath, {
      workerData: {
        filePath,
      },
    });

    worker.on("message", (message: WorkerResponse) => {
      if (!message.success) {
        logger.error(
          { error: message.error },
          "Upload worker returned failure",
        );
        reject(new Error(message.error));
        return;
      }

      logger.info({ totalRows: message.totalRows }, "Upload worker completed");
      resolve(message);
    });

    worker.on("error", (error) => {
      logger.error({ error }, "Upload worker errored");
      reject(error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        logger.error({ code }, "Upload worker exited with non-zero code");
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value === null || value === undefined || value === "") {
    return undefined;
  }

  return String(value).trim();
};

const normalizeNumber = (value: unknown): number | undefined => {
  if (typeof value === null || value === undefined || value === "") {
    return undefined;
  }
  const number = Number(value);

  return Number.isNaN(number) ? undefined : number;
};

const normalizeDate = (value: unknown): Date | undefined => {
  if (typeof value === null || value === undefined || value === "") {
    return undefined;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const processUploadFile = async (filePath: string) => {
  const result = await runWorker(filePath);

  const rows = result.data;

  if (!rows.length) {
    return {
      totalRows: 0,
      insertedPolicies: 0,
    };
  }
  /**
   * Prepare unique Agents
   */

  const agentNames = [
    ...new Set(
      rows
        .map((row) => normalizeString(row.agent))
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  /*
   * --------------------------------------------------
   * 2. Prepare unique Users
   * --------------------------------------------------
   */

  const userKeys = new Map<string, Record<string, unknown>>();

  for (const row of rows) {
    const email = normalizeString(row.email);
    const firstName = normalizeString(row.firstname);

    const key =
      email ?? `${firstName ?? "unknown"}-${normalizeString(row.phone) ?? ""}`;

    if (!userKeys.has(key)) {
      userKeys.set(key, row);
    }
  }

  /*
   * --------------------------------------------------
   * 3. Prepare Accounts
   * --------------------------------------------------
   */

  const accountKeys = new Map<string, Record<string, unknown>>();

  for (const row of rows) {
    const accountName = normalizeString(row.account_name);

    if (!accountName) {
      continue;
    }

    const accountType = normalizeString(row.account_type) ?? "";

    const key = `${accountName}-${accountType}`;

    if (!accountKeys.has(key)) {
      accountKeys.set(key, row);
    }
  }

  /*
   * --------------------------------------------------
   * 4. Prepare LOBs
   * --------------------------------------------------
   */

  const categoryNames = [
    ...new Set(
      rows
        .map((row) => normalizeString(row.category_name))
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  /*
   * --------------------------------------------------
   * 5. Prepare Carriers
   * --------------------------------------------------
   */

  const companyNames = [
    ...new Set(
      rows
        .map((row) => normalizeString(row.company_name))
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  /*
   * --------------------------------------------------
   * 6. Upsert Agents
   * --------------------------------------------------
   */

  await Agent.bulkWrite(
    agentNames.map((agentName) => ({
      updateOne: {
        filter: {
          agentName,
        },
        update: {
          $setOnInsert: {
            agentName,
          },
        },
        upsert: true,
      },
    })),
  );

  /*
   * --------------------------------------------------
   * 7. Upsert Users
   * --------------------------------------------------
   */

  const userOperations = [];

  for (const row of userKeys.values()) {
    const email = normalizeString(row.email);

    const filter = email
      ? { email: email.toLowerCase() }
      : {
          firstName: normalizeString(row.firstname) ?? "Unknown",
          phone: normalizeString(row.phone) ?? undefined,
        };

    userOperations.push({
      updateOne: {
        filter,
        update: {
          $set: {
            userType: normalizeString(row.userType),

            email: email?.toLowerCase(),

            gender: normalizeString(row.gender),

            firstName: normalizeString(row.firstname) ?? "Unknown",

            city: normalizeString(row.city),

            phone: normalizeString(row.phone),

            address: normalizeString(row.address),

            state: normalizeString(row.state),

            zip: normalizeString(row.zip),

            dob: normalizeDate(row.dob),

            applicantId: normalizeString(row.Applicant_ID),
          },
        },
        upsert: true,
      },
    });
  }

  if (userOperations.length) {
    await User.bulkWrite(userOperations);
  }

  /*
   * --------------------------------------------------
   * 8. Upsert User Accounts
   * --------------------------------------------------
   */

  if (accountKeys.size) {
    await UserAccount.bulkWrite(
      [...accountKeys.values()].map((row) => {
        const accountName = normalizeString(row.account_name)!;

        const accountType = normalizeString(row.account_type);

        return {
          updateOne: {
            filter: {
              accountName,
              accountType,
            },
            update: {
              $setOnInsert: {
                accountName,
                accountType,
              },
            },
            upsert: true,
          },
        };
      }),
    );
  }

  /*
   * --------------------------------------------------
   * 9. Upsert LOBs
   * --------------------------------------------------
   */

  if (categoryNames.length) {
    await LOB.bulkWrite(
      categoryNames.map((categoryName) => ({
        updateOne: {
          filter: {
            categoryName,
          },
          update: {
            $setOnInsert: {
              categoryName,
            },
          },
          upsert: true,
        },
      })),
    );
  }

  /*
   * --------------------------------------------------
   * 10. Upsert Carriers
   * --------------------------------------------------
   */

  if (companyNames.length) {
    await Carrier.bulkWrite(
      companyNames.map((companyName) => ({
        updateOne: {
          filter: {
            companyName,
          },
          update: {
            $setOnInsert: {
              companyName,
            },
          },
          upsert: true,
        },
      })),
    );
  }

  /*
   * --------------------------------------------------
   * 11. Fetch generated IDs
   * --------------------------------------------------
   */

  const agents = await Agent.find({
    agentName: {
      $in: agentNames,
    },
  }).lean();

  const users = await User.find({
    $or: [
      ...[...userKeys.values()].map((row) => {
        const email = normalizeString(row.email);

        if (email) {
          return {
            email: email.toLowerCase(),
          };
        }

        return {
          firstName: normalizeString(row.firstname) ?? "Unknown",
          phone: normalizeString(row.phone),
        };
      }),
    ],
  }).lean();

  const accounts = await UserAccount.find({
    $or: [...accountKeys.values()].map((row) => ({
      accountName: normalizeString(row.account_name),
      accountType: normalizeString(row.account_type),
    })),
  }).lean();

  const lobs = await LOB.find({
    categoryName: {
      $in: categoryNames,
    },
  }).lean();

  const carriers = await Carrier.find({
    companyName: {
      $in: companyNames,
    },
  }).lean();

  /*
   * --------------------------------------------------
   * 12. Convert documents into Maps
   * --------------------------------------------------
   */

  const agentMap = new Map(agents.map((agent) => [agent.agentName, agent._id]));

  const userMap = new Map(
    users.map((user) => [
      user.email ?? `${user.firstName}-${user.phone ?? ""}`,
      user._id,
    ]),
  );

  const accountMap = new Map(
    accounts.map((account) => [
      `${account.accountName}-${account.accountType ?? ""}`,
      account._id,
    ]),
  );

  const lobMap = new Map(lobs.map((lob) => [lob.categoryName, lob._id]));

  const carrierMap = new Map(
    carriers.map((carrier) => [carrier.companyName, carrier._id]),
  );

  /*
   * --------------------------------------------------
   * 13. Create Policies
   * --------------------------------------------------
   */

  const policyOperations = [];

  for (const row of rows) {
    const policyNumber = normalizeString(row.policy_number);

    if (!policyNumber) {
      continue;
    }

    const agentName = normalizeString(row.agent);

    const email = normalizeString(row.email);

    const firstName = normalizeString(row.firstname) ?? "Unknown";

    const phone = normalizeString(row.phone);

    const accountName = normalizeString(row.account_name);

    const accountType = normalizeString(row.account_type);

    const categoryName = normalizeString(row.category_name);

    const companyName = normalizeString(row.company_name);

    const userKey = email ? email.toLowerCase() : `${firstName}-${phone ?? ""}`;

    const accountKey = accountName ? `${accountName}-${accountType ?? ""}` : "";

    const agentId = agentName ? agentMap.get(agentName) : undefined;

    const userId = userMap.get(userKey);

    const accountId = accountMap.get(accountKey);

    const lobId = categoryName ? lobMap.get(categoryName) : undefined;

    const carrierId = companyName ? carrierMap.get(companyName) : undefined;

    if (!agentId || !userId || !accountId || !lobId || !carrierId) {
      console.warn(`Skipping policy ${policyNumber}: missing reference`);

      continue;
    }

    policyOperations.push({
      updateOne: {
        filter: {
          policyNumber,
        },

        update: {
          $set: {
            policyMode: normalizeString(row.policy_mode),

            producer: normalizeString(row.producer),

            premiumAmountWritten: normalizeNumber(row.premium_amount_written),

            premiumAmount: normalizeNumber(row.premium_amount),

            policyType: normalizeString(row.policy_type),

            policyStartDate: normalizeDate(row.policy_start_date),

            policyEndDate: normalizeDate(row.policy_end_date),

            csr: normalizeString(row.csr),

            agentId,
            userId,
            accountId,
            lobId,
            carrierId,
          },
        },

        upsert: true,
      },
    });
  }

  /*
   * --------------------------------------------------
   * 14. Bulk insert/update policies
   * --------------------------------------------------
   */

  if (policyOperations.length) {
    await Policy.bulkWrite(policyOperations, {
      ordered: false,
    });
  }
   return {
     totalRows: rows.length,
     insertedPolicies: policyOperations.length,
   };
};
