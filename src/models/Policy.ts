import { Schema, model, Document, Types } from "mongoose";

export interface IPolicy extends Document {
  policyNumber: string;

  policyMode?: string;
  producer?: string;

  premiumAmountWritten?: number;
  premiumAmount?: number;

  policyType?: string;

  policyStartDate?: Date;
  policyEndDate?: Date;

  csr?: string;

  agentId: Types.ObjectId;
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  lobId: Types.ObjectId;
  carrierId: Types.ObjectId;
}

const policySchema = new Schema<IPolicy>(
  {
    policyNumber: {
      type: String,
      required: true,
      trim: true,
    },

    policyMode: {
      type: String,
      trim: true,
    },

    producer: {
      type: String,
      trim: true,
    },

    premiumAmountWritten: {
      type: Number,
    },

    premiumAmount: {
      type: Number,
    },

    policyType: {
      type: String,
      trim: true,
    },

    policyStartDate: {
      type: Date,
    },

    policyEndDate: {
      type: Date,
    },

    csr: {
      type: String,
      trim: true,
    },

    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountId: {
      type: Schema.Types.ObjectId,
      ref: "UserAccount",
      required: true,
    },

    lobId: {
      type: Schema.Types.ObjectId,
      ref: "LOB",
      required: true,
    },

    carrierId: {
      type: Schema.Types.ObjectId,
      ref: "Carrier",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

policySchema.index({ policyNumber: 1 }, { unique: true });

policySchema.index({ userId: 1 });

policySchema.index({ carrierId: 1 });

policySchema.index({ lobId: 1 });

export const Policy = model<IPolicy>("Policy", policySchema);
