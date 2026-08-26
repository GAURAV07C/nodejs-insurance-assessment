import { axios, BACKEND_URL } from "./helpers/http";

describe("cheak", () => {
  test("health", async () => {
    const res = await axios.get(`${BACKEND_URL}/health`);

    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual({
      success: true,
      message: "Server is healthy",
    });
  });
});
