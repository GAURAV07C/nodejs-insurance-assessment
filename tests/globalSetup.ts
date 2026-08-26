import app from "../src/app";

export default async function globalSetup(): Promise<void> {
  const port = Number(process.env.PORT) || 5000;

  await new Promise<void>((resolve) => {
    (globalThis as any).__SERVER__ = app.listen(port, () => resolve());
  });
}
