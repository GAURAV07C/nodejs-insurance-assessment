import { Schema, model, Document } from "mongoose";

export interface IUserAccount extends Document {
  accountName: string;
  accountType?: string;
}

const userAccountSchema = new Schema<IUserAccount>(
  {
    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountType: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userAccountSchema.index(
  {
    accountName: 1,
    accountType: 1,
  },
  {
    unique: true,
  },
);

export const UserAccount = model<IUserAccount>(
  "UserAccount",
  userAccountSchema,
);
