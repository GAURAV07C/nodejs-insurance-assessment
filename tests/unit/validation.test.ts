import { validateScheduleMessage } from "../../src/middleware/message.validation";

type Res = {
  statusCode: number;
  body: any;
  nextCalled: boolean;
};

const run = (body: unknown): Res => {
  const req: any = { body };
  const res: any = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;

      return this;
    },
    json(payload: any) {
      this.body = payload;

      return this;
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  validateScheduleMessage(req, res, next);

  return {
    statusCode: res.statusCode,
    body: res.body,
    nextCalled,
  };
};

describe("validateScheduleMessage middleware", () => {
  test("calls next() when message, day and time are valid", () => {
    const res = run({ message: "Hi", day: "2026-08-28", time: "14:30" });

    expect(res.nextCalled).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  test("rejects when message is missing", () => {
    const res = run({ day: "2026-08-28", time: "14:30" });

    expect(res.nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/message/i);
  });

  test("rejects when message is an empty string", () => {
    const res = run({ message: "", day: "2026-08-28", time: "14:30" });

    expect(res.nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  test("rejects when message is only whitespace", () => {
    const res = run({ message: "   ", day: "2026-08-28", time: "14:30" });

    expect(res.nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  test("rejects when message is not a string", () => {
    const res = run({ message: 123, day: "2026-08-28", time: "14:30" });

    expect(res.nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  test("rejects day not in YYYY-MM-DD", () => {
    const res = run({ message: "Hi", day: "28-08-2026", time: "14:30" });

    expect(res.nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/YYYY-MM-DD/i);
  });

  test("rejects time not in HH:mm", () => {
    const res = run({ message: "Hi", day: "2026-08-28", time: "2:30" });

    expect(res.nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/HH:mm/i);
  });
});
