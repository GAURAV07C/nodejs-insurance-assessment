import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup(): Promise<void> {
  const mongod = await MongoMemoryServer.create();

  (globalThis as any).__MONGOD__ = mongod;

  process.env.MONGODB_URI = mongod.getUri();
}
