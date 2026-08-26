export default async function globalTeardown(): Promise<void> {
  const server = (globalThis as any).__SERVER__;

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((err: any) => (err ? reject(err) : resolve()));
    });
  }
}
