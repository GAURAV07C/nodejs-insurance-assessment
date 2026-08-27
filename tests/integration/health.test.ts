import { app, request } from "../helpers/request";

describe("GET /health", () => {
  test("200 returns healthy status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Server is healthy",
    });
  });

  test("404 for an unknown route", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
  });
});
