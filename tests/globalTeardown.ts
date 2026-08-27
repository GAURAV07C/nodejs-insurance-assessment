export default async function globalTeardown(): Promise<void> {
  const mongod = (globalThis as any).__MONGOD__ as {
    stop: () => Promise<void>;
  } | undefined;

  if (mongod) {
    await mongod.stop();
  }
}
