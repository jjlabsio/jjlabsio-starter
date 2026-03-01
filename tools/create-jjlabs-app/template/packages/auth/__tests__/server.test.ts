import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@repo/database", () => ({
  database: {},
}));

vi.mock("../src/keys", () => ({
  env: {
    BETTER_AUTH_SECRET: "a-secret-that-is-at-least-32-characters-long",
    BETTER_AUTH_URL: "http://localhost:3000",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
  },
}));

describe("server", () => {
  it("should export auth instance", async () => {
    const { auth } = await import("../src/server");

    expect(auth).toBeDefined();
  });

  it("should have api.getSession function", async () => {
    const { auth } = await import("../src/server");

    expect(auth.api.getSession).toBeDefined();
    expect(typeof auth.api.getSession).toBe("function");
  });
});
