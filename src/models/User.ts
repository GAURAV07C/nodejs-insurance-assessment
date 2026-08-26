import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  userType?: string;
  email?: string;
  gender?: string;
  firstName: string;
  city?: string;
  phone?: string;
  address?: string;
  state?: string;
  zip?: string;
  dob?: Date;
  primary?: boolean;
  applicantId?: string;
}

const userSchema = new Schema<IUser>(
  {
    userType: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    gender: {
      type: String,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    zip: {
      type: String,
      trim: true,
    },

    dob: {
      type: Date,
    },

    primary: {
      type: Boolean,
    },

    applicantId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.index({ firstName: 1 });

export const User = model<IUser>("User", userSchema);
