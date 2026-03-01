import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("../src/keys", () => ({
  env: { DATABASE_URL: "postgresql://localhost:5432/testdb" },
}));

describe("index barrel export", () => {
  it("should export database instance", async () => {
    const mod = await import("../src/index");

    expect(mod.database).toBeDefined();
  });

  it("should export env", async () => {
    const mod = await import("../src/index");

    expect(mod.env).toBeDefined();
    expect(mod.env.DATABASE_URL).toBe("postgresql://localhost:5432/testdb");
  });

  it("should re-export Prisma types", async () => {
    const mod = await import("../src/index");

    expect(mod.Prisma).toBeDefined();
  });
});
