import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enabled: false,
  findUnique: vi.fn(),
  upsert: vi.fn(),
  signUpEmail: vi.fn(),
  signInEmail: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      signUpEmail: mocks.signUpEmail,
      signInEmail: mocks.signInEmail,
    },
  },
  env: { BETTER_AUTH_SECRET: "a-secret-that-is-at-least-32-characters-long" },
  get localDevAuthEnabled() {
    return mocks.enabled;
  },
}));

vi.mock("@repo/database", () => ({
  database: {
    user: { findUnique: mocks.findUnique },
    subscription: { upsert: mocks.upsert },
  },
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

describe("development login", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.enabled = false;
  });

  it("does not touch the database outside local development", async () => {
    const { signInAsDev } = await import("./sign-in-as-dev");

    await expect(signInAsDev("/")).resolves.toEqual({
      error: "Development login is unavailable.",
    });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it("creates the test account once, prepares access, and signs in", async () => {
    mocks.enabled = true;
    mocks.findUnique.mockResolvedValue(null);
    mocks.signUpEmail.mockResolvedValue({ user: { id: "dev-user" } });
    const { signInAsDev } = await import("./sign-in-as-dev");

    await signInAsDev("/dashboard");

    expect(mocks.signUpEmail).toHaveBeenCalledWith({
      body: {
        name: "Development Test",
        email: "dev@example.test",
        password: expect.any(String),
      },
    });
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId: "dev-user" },
      create: {
        userId: "dev-user",
        status: "ACTIVE",
        currentPeriodStart: expect.any(Date),
      },
      update: { status: "ACTIVE" },
    });
    expect(mocks.signInEmail).toHaveBeenCalledWith({
      body: {
        email: "dev@example.test",
        password: expect.any(String),
      },
    });
    expect(mocks.signInEmail.mock.calls[0]?.[0]?.body.password).toBe(
      mocks.signUpEmail.mock.calls[0]?.[0]?.body.password,
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("reuses the same account on later logins", async () => {
    mocks.enabled = true;
    mocks.findUnique.mockResolvedValue({ id: "dev-user" });
    const { signInAsDev } = await import("./sign-in-as-dev");

    await signInAsDev("https://example.com");

    expect(mocks.signUpEmail).not.toHaveBeenCalled();
    expect(mocks.signInEmail).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/");
  });
});
