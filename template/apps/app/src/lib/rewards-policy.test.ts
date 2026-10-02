import { describe, expect, it } from "vitest";
import { normalizePostUrl } from "./rewards-policy";

describe("rewards boundaries", () => {
  it("accepts public HTTPS URLs without fetching and normalizes fragments", () => {
    expect(normalizePostUrl(" https://example.com/post#section ")).toBe("https://example.com/post");
    for (const url of [null, "javascript:alert(1)", "http://example.com", "https://localhost/post", "https://user:password@example.com", "x".repeat(2049)]) expect(() => normalizePostUrl(url)).toThrow();
  });
});
