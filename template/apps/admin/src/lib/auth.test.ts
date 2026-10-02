import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock("@repo/database", () => ({
  database: { user: { findUnique: mocks.find } },
}));
vi.mock("@repo/auth/keys", () => ({
  env: {
    BETTER_AUTH_URL: "http://localhost:4001",
    BETTER_AUTH_SECRET: "admin-distinct-secret-that-is-long-enough",
    GOOGLE_CLIENT_ID: "id",
    GOOGLE_CLIENT_SECRET: "secret",
  },
}));
import { auth } from "./auth";
import {
  isAllowedAdmin,
  isLocalAdminDev,
  isAdminIdentity,
  ADMIN_DEV_EMAIL,
} from "./admin-policy";
beforeEach(() => {
  vi.stubEnv("ADMIN_EMAIL", "owner@gmail.com");
  vi.clearAllMocks();
});
it("denies empty, other, alias, and unverified emails", () => {
  expect(isAllowedAdmin("owner@gmail.com", true, "")).toBe(false);
  expect(isAllowedAdmin("other@gmail.com", true)).toBe(false);
  expect(isAllowedAdmin("owner+tag@gmail.com", true)).toBe(false);
  expect(isAllowedAdmin("owner@gmail.com", false)).toBe(false);
  expect(isAllowedAdmin("OWNER@gmail.com", true)).toBe(true);
});
it("has isolated cookies and no password/development login", () => {
  expect(auth.options.advanced?.cookiePrefix).toBe("admin-auth");
  expect(auth.options.emailAndPassword.enabled).toBe(false);
});
it("blocks unauthorized creation and session issuance", async () => {
  const hooks = auth.options.databaseHooks!;
  await expect(
    hooks.user!.create!.before!({
      email: "other@gmail.com",
      emailVerified: true,
    } as never),
  ).rejects.toThrow();
  mocks.find.mockResolvedValue({
    email: "other@gmail.com",
    emailVerified: true,
  });
  await expect(
    hooks.session!.create!.before!({ userId: "existing-app-user" } as never),
  ).rejects.toThrow();
  mocks.find.mockResolvedValue({
    email: "owner@gmail.com",
    emailVerified: true,
  });
  await expect(
    hooks.session!.create!.before!({ userId: "owner" } as never),
  ).resolves.toBeUndefined();
});

it("permits development identity only on local development with an owner configured", () => {
  expect(
    isLocalAdminDev("development", "http://localhost:4001", "owner@gmail.com"),
  ).toBe(true);
  expect(
    isLocalAdminDev("production", "http://localhost:4001", "owner@gmail.com"),
  ).toBe(false);
  expect(
    isLocalAdminDev(
      "development",
      "https://admin.example.com",
      "owner@gmail.com",
    ),
  ).toBe(false);
  expect(isLocalAdminDev("development", "http://localhost:4001", "")).toBe(
    false,
  );
  expect(isAdminIdentity(ADMIN_DEV_EMAIL, false, false)).toBe(false);
  expect(isAdminIdentity(ADMIN_DEV_EMAIL, false, true)).toBe(true);
});
