import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  enabled: false,
  find: vi.fn(),
  signup: vi.fn(),
  signin: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({
  get localDevAuthEnabled() {
    return mocks.enabled;
  },
  auth: { api: { signUpEmail: mocks.signup, signInEmail: mocks.signin } },
}));
vi.mock("@repo/auth/keys", () => ({
  env: { BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters" },
}));
vi.mock("@repo/database", () => ({
  database: { user: { findUnique: mocks.find } },
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { signInAsDev } from "./sign-in-as-dev";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.enabled = false;
});
it("never touches the database when unavailable", async () => {
  expect((await signInAsDev()).error).toBe("Development login is unavailable.");
  expect(mocks.find).not.toHaveBeenCalled();
  expect(mocks.signin).not.toHaveBeenCalled();
});
it("uses a dedicated local admin identity without subscription mutations", async () => {
  mocks.enabled = true;
  mocks.find.mockResolvedValue(null);
  await signInAsDev();
  expect(mocks.signup).toHaveBeenCalledWith({
    body: {
      name: "Development Admin",
      email: "dev-admin@example.test",
      password: expect.any(String),
    },
  });
  expect(mocks.signin).toHaveBeenCalledWith({
    body: {
      email: "dev-admin@example.test",
      password: mocks.signup.mock.calls[0]![0].body.password,
    },
  });
  expect(mocks.redirect).toHaveBeenCalledWith("/rewards");
});
