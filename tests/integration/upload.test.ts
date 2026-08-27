import { app, request } from "../helpers/request";
import { sampleCsv, writeTempFile } from "../helpers/fixtures";

describe("POST /api/upload", () => {
  test("400 when no file is attached", async () => {
    const res = await request(app)
      .post("/api/upload")
      .field("ignored", "x");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/no file/i);
  });

  test("400/500 when file type is not allowed (.txt)", async () => {
    const file = await writeTempFile("just some text", "notes.txt");

    const res = await request(app).post("/api/upload").attach("file", file);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(
      String(res.body.error ?? res.body.message ?? ""),
    ).toMatch(/invalid file type/i);
  });

  test("200 processes a valid CSV and inserts the policy", async () => {
    const unique = `up${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const csv = sampleCsv({
      email: `up.${unique}@example.com`,
      policy_number: `UP-POL-${unique}`,
    });

    const file = await writeTempFile(csv);

    const res = await request(app).post("/api/upload").attach("file", file);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRows).toBe(1);
    expect(res.body.data.processedPolicies).toBe(1);
  });

  test("200 with empty CSV (no data rows) returns zero counts", async () => {
    const file = await writeTempFile("agent,email\n");

    const res = await request(app).post("/api/upload").attach("file", file);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRows).toBe(0);
    expect(res.body.data.processedPolicies).toBe(0);
  });

  test("200 when a row has a policy number but missing references (policy skipped)", async () => {
    const unique = `skip${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const csv = sampleCsv({
      agent: "",
      email: "",
      firstname: "",
      account_name: "",
      category_name: "",
      company_name: "",
      policy_number: `SKIP-POL-${unique}`,
    });

    const file = await writeTempFile(csv);

    const res = await request(app).post("/api/upload").attach("file", file);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRows).toBe(1);
    expect(res.body.data.processedPolicies).toBe(0);
  });
});
