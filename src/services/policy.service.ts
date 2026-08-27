import { Policy } from "../models/Policy";
import { logger } from "../config/logger";

export const searchPoliciesByUsername = async (username: string) => {
  const searchTerm = username.trim();

  logger.info({ searchTerm }, "Searching policies by username");

  const policies = await Policy.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },

    {
      $match: {
        $or: [
          {
            "user.firstName": {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            "user.email": {
              $regex: searchTerm,
              $options: "i",
            },
          },
        ],
      },
    },

    {
      $lookup: {
        from: "agents",
        localField: "agentId",
        foreignField: "_id",
        as: "agent",
      },
    },

    {
      $unwind: {
        path: "$agent",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "useraccounts",
        localField: "accountId",
        foreignField: "_id",
        as: "account",
      },
    },

    {
      $unwind: {
        path: "$account",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "lobs",
        localField: "lobId",
        foreignField: "_id",
        as: "lob",
      },
    },

    {
      $unwind: {
        path: "$lob",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "carriers",
        localField: "carrierId",
        foreignField: "_id",
        as: "carrier",
      },
    },

    {
      $unwind: {
        path: "$carrier",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 1,
        createdAt: 1,
        updatedAt: 1,

        policyNumber: 1,
        policyMode: 1,
        producer: 1,

        premiumAmountWritten: 1,
        premiumAmount: 1,

        policyType: 1,

        policyStartDate: 1,
        policyEndDate: 1,

        csr: 1,

        user: {
          id: "$user._id",
          userType: "$user.userType",
          firstName: "$user.firstName",
          email: "$user.email",
          gender: "$user.gender",
          phone: "$user.phone",
          city: "$user.city",
          address: "$user.address",
          state: "$user.state",
          zip: "$user.zip",
          dob: "$user.dob",
          applicantId: "$user.applicantId",
        },

        agent: {
          id: "$agent._id",
          name: "$agent.agentName",
        },

        account: {
          id: "$account._id",
          name: "$account.accountName",
          type: "$account.accountType",
        },

        lob: {
          id: "$lob._id",
          categoryName: "$lob.categoryName",
        },

        carrier: {
          id: "$carrier._id",
          companyName: "$carrier.companyName",
        },
      },
    },
  ]);

  logger.info({ count: policies.length }, "Policy search aggregation completed");

  return policies;
};
