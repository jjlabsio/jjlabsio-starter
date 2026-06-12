import { describe, it, expect, vi, beforeEach } from "vitest";

describe("keys", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
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

  it("should use a placeholder URL when validation is skipped", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("SKIP_ENV_VALIDATION", "1");

    const { env } = await import("../src/keys");

    expect(env.DATABASE_URL).toBe(
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
    );
  });
});
