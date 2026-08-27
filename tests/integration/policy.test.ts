import { app, request } from "../helpers/request";
import { sampleCsv, writeTempFile } from "../helpers/fixtures";

const seedPolicy = async (overrides: Record<string, string> = {}) => {
  const unique = `pol${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const csv = sampleCsv({
    email: `seed.${unique}@example.com`,
    firstname: `Seeduser${unique}`,
    policy_number: `SEED-POL-${unique}`,
    ...overrides,
  });

  const file = await writeTempFile(csv);

  await request(app).post("/api/upload").attach("file", file);

  return {
    email: `seed.${unique}@example.com`,
    firstname: `Seeduser${unique}`,
    policyNumber: `SEED-POL-${unique}`,
  };
};

describe("GET /api/policies/search", () => {
  test("400 when username query param is missing", async () => {
    const res = await request(app).get("/api/policies/search");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/username/i);
  });

  test("400 when username is an empty string", async () => {
    const res = await request(app).get("/api/policies/search?username=");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("400 when username is only whitespace", async () => {
    const res = await request(app).get(
      "/api/policies/search?username=%20%20%20",
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("404 when no policies match the username", async () => {
    const res = await request(app).get(
      "/api/policies/search?username=zzz-no-such-user-zzz",
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test("200 when policies match by email (case-insensitive)", async () => {
    const seeded = await seedPolicy();

    const res = await request(app).get(
      `/api/policies/search?username=${encodeURIComponent(seeded.email.toUpperCase())}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(
      res.body.data.some((p: any) => p.policyNumber === seeded.policyNumber),
    ).toBe(true);
  });

  test("200 when policies match by first name (case-insensitive)", async () => {
    const seeded = await seedPolicy();

    const res = await request(app).get(
      `/api/policies/search?username=${encodeURIComponent(
        seeded.firstname.toLowerCase(),
      )}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(
      res.body.data.some((p: any) => p.policyNumber === seeded.policyNumber),
    ).toBe(true);
  });

  test("200 response contains nested user/agent/account/lob/carrier", async () => {
    const seeded = await seedPolicy();

    const res = await request(app).get(
      `/api/policies/search?username=${encodeURIComponent(seeded.email)}`,
    );

    const policy = res.body.data.find(
      (p: any) => p.policyNumber === seeded.policyNumber,
    );

    expect(policy).toBeDefined();
    expect(policy.user).toBeDefined();
    expect(policy.agent).toBeDefined();
    expect(policy.account).toBeDefined();
    expect(policy.lob).toBeDefined();
    expect(policy.carrier).toBeDefined();
  });
});

describe("GET /api/policies/aggregate/users", () => {
  test("200 returns aggregated counts", async () => {
    await seedPolicy();

    const res = await request(app).get("/api/policies/aggregate/users");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);

    res.body.data.forEach((u: any) => {
      expect(u).toHaveProperty("userId");
      expect(u).toHaveProperty("totalPolicies");
      expect(typeof u.totalPolicies).toBe("number");
    });
  });
});
