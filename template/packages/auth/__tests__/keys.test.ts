import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: ({
    server,
    runtimeEnv,
  }: {
    server: Record<string, { parse: (v: unknown) => unknown }>;
    runtimeEnv: Record<string, unknown>;
  }) => {
    const result: Record<string, unknown> = {};
    for (const [key, schema] of Object.entries(server)) {
      const value = runtimeEnv[key];
      result[key] = schema.parse(value);
    }
    return result;
  },
}));

vi.mock("server-only", () => ({}));

describe("keys", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should export env with all validated auth variables", async () => {
    vi.stubEnv(
      "BETTER_AUTH_SECRET",
      "a-secret-that-is-at-least-32-characters-long",
    );
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-client-secret");

    const { env } = await import("../src/keys");

    expect(env).toBeDefined();
    expect(env.BETTER_AUTH_SECRET).toBe(
      "a-secret-that-is-at-least-32-characters-long",
    );
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.GOOGLE_CLIENT_ID).toBe("google-client-id");
    expect(env.GOOGLE_CLIENT_SECRET).toBe("google-client-secret");
  });

  it("should reject missing BETTER_AUTH_SECRET", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-client-secret");

    await expect(import("../src/keys")).rejects.toThrow();
  });

  it("should reject BETTER_AUTH_SECRET shorter than 32 characters", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "too-short");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-client-secret");

    await expect(import("../src/keys")).rejects.toThrow();
  });

  it("should reject invalid BETTER_AUTH_URL", async () => {
    vi.stubEnv(
      "BETTER_AUTH_SECRET",
      "a-secret-that-is-at-least-32-characters-long",
    );
    vi.stubEnv("BETTER_AUTH_URL", "not-a-url");
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-client-secret");

    await expect(import("../src/keys")).rejects.toThrow();
  });

  it("should reject missing GOOGLE_CLIENT_ID", async () => {
    vi.stubEnv(
      "BETTER_AUTH_SECRET",
      "a-secret-that-is-at-least-32-characters-long",
    );
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-client-secret");

    await expect(import("../src/keys")).rejects.toThrow();
  });

  it("should reject missing GOOGLE_CLIENT_SECRET", async () => {
    vi.stubEnv(
      "BETTER_AUTH_SECRET",
      "a-secret-that-is-at-least-32-characters-long",
    );
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");

    await expect(import("../src/keys")).rejects.toThrow();
  });
});
