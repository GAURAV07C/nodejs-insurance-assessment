/**
 * this is  Agent model which is used to store the agent information in the database.
*/

import { Schema, model, Document } from "mongoose";

export interface IAgent extends Document {
  agentName: string;
}

const agentSchema = new Schema<IAgent>(
  {
    agentName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * this line of code is used to create an index on the agentName field in the agentSchema. The index is created with the unique option set to true, which means that no two documents in the collection can have the same value for the agentName field. This ensures that each agent has a unique name in the database.
 */

agentSchema.index({ agentName: 1 }, { unique: true });

export const Agent = model<IAgent>("Agent", agentSchema);
