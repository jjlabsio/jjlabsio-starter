import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  config: {
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "Acme <support@example.test>",
  },
}));
vi.mock("server-only", () => ({}));
vi.mock("../src/keys", () => ({ env: mocks.config }));
vi.mock("resend", () => ({
  Resend: class {
    batch = { send: mocks.send };
  },
}));
import { sendEmailBatch } from "../src/batch";
const input = {
  recipients: ["first@example.test", "second@example.test"],
  subject: "Notice",
  html: "<p>Hello</p>",
  text: "Hello",
  from: "Acme <support@example.test>",
  key: "campaign/test/batch/one",
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.config.RESEND_API_KEY = "re_test";
});
it("never exposes other recipients through a shared To list", async () => {
  mocks.send.mockResolvedValue({
    data: { data: [{ id: "one" }, { id: "two" }] },
    error: null,
  });
  expect(await sendEmailBatch(input)).toEqual(["one", "two"]);
  expect(mocks.send).toHaveBeenCalledWith(
    [
      expect.objectContaining({ to: "first@example.test" }),
      expect.objectContaining({ to: "second@example.test" }),
    ],
    { idempotencyKey: input.key },
  );
});
it("blocks invalid recipients, placeholder keys and unconfirmed responses", async () => {
  await expect(
    sendEmailBatch({ ...input, recipients: ["invalid"] }),
  ).rejects.toThrow();
  expect(mocks.send).not.toHaveBeenCalled();
  mocks.config.RESEND_API_KEY = "re_xxx";
  await expect(sendEmailBatch(input)).rejects.toThrow("not configured");
  mocks.config.RESEND_API_KEY = "re_test";
  mocks.send.mockResolvedValue({
    data: null,
    error: { name: "rate_limit_exceeded" },
  });
  await expect(sendEmailBatch(input)).rejects.toThrow("not confirmed");
});
