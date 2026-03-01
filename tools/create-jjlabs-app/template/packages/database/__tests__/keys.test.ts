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

  it("should export env with validated DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/testdb");

    const { env } = await import("../src/keys");

    expect(env).toBeDefined();
    expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/testdb");
  });

  it("should reject missing DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "");

    await expect(import("../src/keys")).rejects.toThrow();
  });

  it("should reject invalid URL format", async () => {
    vi.stubEnv("DATABASE_URL", "not-a-url");

    await expect(import("../src/keys")).rejects.toThrow();
  });
});
