import { app, request } from "../helpers/request";
import { futureSchedule } from "../helpers/fixtures";

const schedule = (body: unknown) =>
  request(app).post("/api/messages/schedule").send(body as any);

describe("POST /api/messages/schedule", () => {
  test("201 schedules a valid future message", async () => {
    const { day, time } = futureSchedule(120);

    const res = await schedule({ message: "Reminder", day, time });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.status).toBe("scheduled");
    expect(res.body.data.message).toBe("Reminder");
  });

  test("400 when message is missing", async () => {
    const { day, time } = futureSchedule();

    const res = await schedule({ day, time });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/message/i);
  });

  test("400 when day is missing", async () => {
    const { time } = futureSchedule();

    const res = await schedule({ message: "Hi", time });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/day/i);
  });

  test("400 when time is missing", async () => {
    const { day } = futureSchedule();

    const res = await schedule({ message: "Hi", day });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/time/i);
  });

  test("400 when message is an empty string", async () => {
    const { day, time } = futureSchedule();

    const res = await schedule({ message: "", day, time });

    expect(res.status).toBe(400);
  });

  test("400 when message is only whitespace", async () => {
    const { day, time } = futureSchedule();

    const res = await schedule({ message: "   ", day, time });

    expect(res.status).toBe(400);
  });

  test("400 when message is not a string", async () => {
    const { day, time } = futureSchedule();

    const res = await schedule({ message: 123, day, time });

    expect(res.status).toBe(400);
  });

  test("400 when day is not YYYY-MM-DD", async () => {
    const { time } = futureSchedule();

    const res = await schedule({ message: "Hi", day: "28-08-2026", time });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/YYYY-MM-DD/i);
  });

  test("400 when day uses slashes instead of dashes", async () => {
    const { time } = futureSchedule();

    const res = await schedule({ message: "Hi", day: "2026/08/28", time });

    expect(res.status).toBe(400);
  });

  test("400 when time is not HH:mm", async () => {
    const { day } = futureSchedule();

    const res = await schedule({ message: "Hi", day, time: "2:30" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/HH:mm/i);
  });

  test("400 when time omits a digit (14:3)", async () => {
    const { day } = futureSchedule();

    const res = await schedule({ message: "Hi", day, time: "14:3" });

    expect(res.status).toBe(400);
  });

  test("400 when time is a bare number (1430)", async () => {
    const { day } = futureSchedule();

    const res = await schedule({ message: "Hi", day, time: "1430" });

    expect(res.status).toBe(400);
  });

  test("400 when day is an invalid calendar date (2026-13-01)", async () => {
    const { time } = futureSchedule();

    const res = await schedule({ message: "Hi", day: "2026-13-01", time });

    expect(res.status).toBe(400);
  });

  test("400 when scheduled time is in the past", async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");

    const day = `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}`;
    const time = `${pad(past.getHours())}:${pad(past.getMinutes())}`;

    const res = await schedule({ message: "Hi", day, time });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });
});

describe("GET /api/messages/scheduled", () => {
  test("200 returns a list of scheduled messages", async () => {
    const res = await request(app).get("/api/messages/scheduled");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
  });
});

describe("DELETE /api/messages/scheduled/:id", () => {
  test("200 cancels a freshly scheduled message", async () => {
    const { day, time } = futureSchedule(180);

    const created = await schedule({ message: "To cancel", day, time });

    expect(created.status).toBe(201);

    const id = created.body.data.id;
    const res = await request(app).delete(`/api/messages/scheduled/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("cancelled");
  });

  test("400 when cancelling the same message again", async () => {
    const { day, time } = futureSchedule(240);

    const created = await schedule({ message: "To cancel twice", day, time });
    const id = created.body.data.id;

    await request(app).delete(`/api/messages/scheduled/${id}`);

    const res = await request(app).delete(`/api/messages/scheduled/${id}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only scheduled/i);
  });

  test("400 when id does not exist", async () => {
    const fakeId = "64b2f0c2c2a4f0c2c2a4f0c2";

    const res = await request(app).delete(`/api/messages/scheduled/${fakeId}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not found/i);
  });

  test("400 when id is not a valid ObjectId", async () => {
    const res = await request(app).delete(
      "/api/messages/scheduled/not-a-valid-id",
    );

    expect(res.status).toBe(400);
  });
});
