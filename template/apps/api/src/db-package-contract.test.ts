import { describe, expect, it } from "vitest";

describe("@repo/database package contract", () => {
  it("exposes the shared Prisma client through the prisma subpath", async () => {
    const { default: prisma, database } = await import("@repo/database/prisma");

    expect(prisma).toBe(database);
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
  });
});
