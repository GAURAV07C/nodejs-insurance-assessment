import mongoose from "mongoose";
import { messageScheduler } from "../src/services/message-scheduler.service";

const baseUri = (process.env.MONGODB_URI || "").replace(/\/[^/?]*$/, "");
const dbName = `test_${process.env.JEST_WORKER_ID ?? "0"}`;

beforeAll(async () => {
  await mongoose.connect(`${baseUri}/${dbName}`);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  messageScheduler.cancelAll();

  await mongoose.disconnect();
});
