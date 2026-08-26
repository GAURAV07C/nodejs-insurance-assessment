import { Schema, model, Document } from "mongoose";

export interface ICarrier extends Document {
  companyName: string;
}

const carrierSchema = new Schema<ICarrier>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

carrierSchema.index({ companyName: 1 }, { unique: true });

export const Carrier = model<ICarrier>("Carrier", carrierSchema);
