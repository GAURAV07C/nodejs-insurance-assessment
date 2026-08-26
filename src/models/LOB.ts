import { Schema, model, Document } from "mongoose";

export interface ILOB extends Document {
  categoryName: string;
}

const lobSchema = new Schema<ILOB>(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

lobSchema.index({ categoryName: 1 }, { unique: true });

export const LOB = model<ILOB>("LOB", lobSchema);
