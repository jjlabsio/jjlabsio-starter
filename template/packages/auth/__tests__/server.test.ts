import { afterEach, describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
const sendWelcomeEmail = vi.hoisted(() => vi.fn());
vi.mock("@repo/email/welcome", () => ({ sendWelcomeEmail }));

vi.mock("@repo/database", () => ({
  database: {},
}));

const mockEnv = vi.hoisted(() => ({
  BETTER_AUTH_SECRET: "a-secret-that-is-at-least-32-characters-long",
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
}));

vi.mock("../src/keys", () => ({
  env: mockEnv,
}));

describe("server", () => {
  afterEach(() => {
    mockEnv.BETTER_AUTH_URL = "http://localhost:3000";
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
    vi.useRealTimers();
    sendWelcomeEmail.mockReset();
  });

  it("should export auth instance", async () => {
    const { auth } = await import("../src/server");

    expect(auth).toBeDefined();
  });

  it("sends welcome only for a verified Google-created user", async () => {
    const { auth } = await import("../src/server");
    const after = auth.options.databaseHooks.user.create.after;
    const user = {
      id: "new-user",
      name: "Alex",
      email: "alex@example.test",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const context = {
      path: "/callback/:id",
      params: { id: "google" },
    } as unknown as Parameters<typeof after>[1];
    await after(user, context);
    expect(sendWelcomeEmail).toHaveBeenCalledExactlyOnceWith(
      user,
      mockEnv.BETTER_AUTH_URL,
    );
    // No session hook: existing-user logins do not trigger a welcome.
    expect(auth.options.databaseHooks).not.toHaveProperty("session");
  });

  it("skips dev signup, other providers, unverified users and missing context", async () => {
    const { auth } = await import("../src/server");
    const after = auth.options.databaseHooks.user.create.after;
    const user = {
      id: "new-user",
      name: "Alex",
      email: "alex@example.test",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    for (const ctx of [
      null,
      { path: "/sign-up/email" },
      { path: "/callback/:id", params: { id: "github" } },
    ]) {
      await after(user, ctx as Parameters<typeof after>[1]);
    }
    await after({ ...user, emailVerified: false }, {
      path: "/callback/:id",
      params: { id: "google" },
    } as unknown as Parameters<typeof after>[1]);
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("does not fail signup when delivery rejects", async () => {
    const { auth } = await import("../src/server");
    const after = auth.options.databaseHooks.user.create.after;
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    sendWelcomeEmail.mockRejectedValue(new Error("provider unavailable"));
    await expect(
      after(
        {
          id: "new-user",
          name: "Alex",
          email: "alex@example.test",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          path: "/callback/:id",
          params: { id: "google" },
        } as unknown as Parameters<typeof after>[1],
      ),
    ).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith("Welcome email delivery failed");
  });

  it("continues signup after 3 seconds if the email provider never responds", async () => {
    const { auth } = await import("../src/server");
    const after = auth.options.databaseHooks.user.create.after;
    vi.useFakeTimers();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    sendWelcomeEmail.mockReturnValue(new Promise(() => {}));
    const pending = after(
      {
        id: "new-user",
        name: "Alex",
        email: "alex@example.test",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        path: "/callback/:id",
        params: { id: "google" },
      } as unknown as Parameters<typeof after>[1],
    );
    await vi.advanceTimersByTimeAsync(3000);
    await expect(pending).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith("Welcome email delivery failed");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("should have api.getSession function", async () => {
    const { auth } = await import("../src/server");

    expect(auth.api.getSession).toBeDefined();
    expect(typeof auth.api.getSession).toBe("function");
  });

  it("enables local development login only in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();
    const development = await import("../src/server");
    expect(development.localDevAuthEnabled).toBe(true);
    expect(development.auth.options.emailAndPassword.enabled).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const production = await import("../src/server");
    expect(production.localDevAuthEnabled).toBe(false);
    expect(production.auth.options.emailAndPassword.enabled).toBe(false);

    vi.stubEnv("NODE_ENV", "development");
    mockEnv.BETTER_AUTH_URL = "https://preview.example.com";
    vi.resetModules();
    const remote = await import("../src/server");
    expect(remote.localDevAuthEnabled).toBe(false);
    expect(remote.auth.options.emailAndPassword.enabled).toBe(false);
  });
});
