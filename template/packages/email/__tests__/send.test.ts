import { beforeEach, expect, it, vi } from "vitest";
import { createElement } from "react";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  config: {
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "Acme <hello@example.test>",
  },
}));
vi.mock("server-only", () => ({}));
vi.mock("../src/keys", () => ({ env: mocks.config }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
import {
  sendEmail,
  emailSendingConfigured,
  sendEmailBatch,
} from "../src/index";

const input = {
  to: "alex@example.test",
  subject: "Notice",
  react: createElement("p", null, "Hello Alex"),
  idempotencyKey: "notice/event-1",
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.config.RESEND_API_KEY = "re_test";
  mocks.config.EMAIL_FROM = "Acme <hello@example.test>";
});
it("exports a reusable server API with HTML/text, configured sender and idempotency", async () => {
  mocks.send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  expect(typeof sendEmailBatch).toBe("function");
  expect(await sendEmail(input)).toEqual({ id: "email-1" });
  expect(mocks.send).toHaveBeenCalledWith(
    expect.objectContaining({
      from: mocks.config.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: expect.stringContaining("Hello Alex"),
      text: expect.stringContaining("Hello Alex"),
    }),
    { idempotencyKey: input.idempotencyKey },
  );
  await sendEmail({ ...input, from: "Acme <support@example.test>" });
  expect(mocks.send.mock.lastCall?.[0].from).toBe(
    "Acme <support@example.test>",
  );
});
it("blocks missing, whitespace or placeholder settings before contacting Resend", async () => {
  for (const key of ["", " ", "re_xxx", " re_xxx_example "]) {
    mocks.config.RESEND_API_KEY = key;
    expect(emailSendingConfigured()).toBe(false);
    await expect(sendEmail(input)).rejects.toThrow("not configured");
  }
  mocks.config.RESEND_API_KEY = "re_test";
  mocks.config.EMAIL_FROM = " ";
  expect(emailSendingConfigured()).toBe(false);
  await expect(sendEmail(input)).rejects.toThrow("not configured");
  expect(mocks.send).not.toHaveBeenCalled();
});
it("rejects invalid input and does not report unconfirmed provider responses as success", async () => {
  for (const invalid of [
    { to: "invalid" },
    { to: [] },
    { subject: " " },
    { subject: "Hello\nInjected" },
  ]) {
    await expect(sendEmail({ ...input, ...invalid })).rejects.toThrow();
  }
  expect(mocks.send).not.toHaveBeenCalled();
  mocks.send.mockResolvedValue({
    data: null,
    error: { name: "validation_error", message: "private provider details" },
  });
  await expect(sendEmail(input)).rejects.toThrow(
    "Email delivery failed: validation_error",
  );
  mocks.send.mockResolvedValue({ data: null, error: null });
  await expect(sendEmail(input)).rejects.toThrow("not confirmed");
});
