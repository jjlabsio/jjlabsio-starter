import { describe, it, expect } from "vitest";

describe("client", () => {
  it("should export signIn, signOut, and useSession", async () => {
    const { signIn, signOut, useSession } = await import("../src/client");

    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
    expect(useSession).toBeDefined();
  });

  it("should have signIn.social function", async () => {
    const { signIn } = await import("../src/client");

    expect(signIn.social).toBeDefined();
    expect(typeof signIn.social).toBe("function");
  });
});
