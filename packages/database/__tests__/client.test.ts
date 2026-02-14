import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("../src/keys", () => ({
  env: { DATABASE_URL: "postgresql://localhost:5432/testdb" },
}));

describe("client", () => {
  beforeEach(() => {
    vi.resetModules();

    const globalAny = globalThis as Record<string, unknown>;
    delete globalAny.prisma;
  });

  it("should export a database instance with $connect method", async () => {
    const { database } = await import("../src/client");

    expect(database).toBeDefined();
    expect(typeof database.$connect).toBe("function");
    expect(typeof database.$disconnect).toBe("function");
  });

  it("should return the same instance (singleton)", async () => {
    const mod1 = await import("../src/client");
    const mod2 = await import("../src/client");

    expect(mod1.database).toBe(mod2.database);
  });

  it("should store instance on globalThis in non-production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const { database } = await import("../src/client");

    const globalAny = globalThis as Record<string, unknown>;
    expect(globalAny.prisma).toBe(database);

    process.env.NODE_ENV = originalEnv;
  });
});
