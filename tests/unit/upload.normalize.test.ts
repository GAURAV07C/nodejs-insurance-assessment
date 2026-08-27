import {
  normalizeDate,
  normalizeNumber,
  normalizeString,
} from "../../src/services/upload.service";

describe("upload.service normalization helpers", () => {
  describe("normalizeString", () => {
    test("trims surrounding whitespace", () => {
      expect(normalizeString("  hello  ")).toBe("hello");
    });

    test("returns undefined for null/undefined/empty", () => {
      expect(normalizeString(null)).toBeUndefined();
      expect(normalizeString(undefined)).toBeUndefined();
      expect(normalizeString("")).toBeUndefined();
    });

    test("stringifies non-string values", () => {
      expect(normalizeString(42)).toBe("42");
    });
  });

  describe("normalizeNumber", () => {
    test("parses numeric strings", () => {
      expect(normalizeNumber("123")).toBe(123);
      expect(normalizeNumber("12.5")).toBe(12.5);
    });

    test("returns undefined for empty/blank/invalid", () => {
      expect(normalizeNumber("")).toBeUndefined();
      expect(normalizeNumber("abc")).toBeUndefined();
      expect(normalizeNumber(null)).toBeUndefined();
    });
  });

  describe("normalizeDate", () => {
    test("parses ISO date strings", () => {
      const d = normalizeDate("2026-01-01");

      expect(d).toBeInstanceOf(Date);
      expect((d as Date).getUTCFullYear()).toBe(2026);
    });

    test("converts excel serial numbers", () => {
      // 25569 == 1970-01-01
      const d = normalizeDate(25569);

      expect(d).toBeInstanceOf(Date);
      expect((d as Date).getUTCFullYear()).toBe(1970);
    });

    test("returns undefined for unparseable input", () => {
      expect(normalizeDate("not-a-date")).toBeUndefined();
      expect(normalizeDate("")).toBeUndefined();
      expect(normalizeDate(null)).toBeUndefined();
    });
  });
});
