import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { render } from "@react-email/components";
import { WelcomeEmail } from "../src/templates/welcome";
import { EMAIL_BRAND } from "../src/config";

const config = vi.hoisted(() => ({
  RESEND_API_KEY: "re_test",
  EMAIL_FROM: "Acme <welcome@example.test>",
}));
const send = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("../src/keys", () => ({ env: config }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
import { sendWelcomeEmail } from "../src/welcome";

describe("welcome email", () => {
  afterEach(() => {
    config.RESEND_API_KEY = "re_test";
    config.EMAIL_FROM = "Acme <welcome@example.test>";
    send.mockReset();
  });
  const user = { id: "user-1", name: "Alex", email: "alex@example.test" };
  it("renders the shared shell, content and workspace CTA", async () => {
    const html = await render(
      createElement(WelcomeEmail, {
        name: "Alex",
        appUrl: "https://app.example.test",
      }),
    );
    expect(html).toContain(`Welcome to ${EMAIL_BRAND}`);
    expect(html).toContain("Hi <!-- -->Alex");
    expect(html).toContain("All rights reserved.");
    expect(html).not.toContain("This email relates to your account.");
    expect(html).toContain('href="https://app.example.test"');
    expect(html).toContain("Open workspace");
    expect(html).not.toContain("Or open this link in your browser:");
    expect(html).not.toContain(">https://app.example.test<");
    expect(html).toContain('name="viewport"');
  });
  it("uses configured sender and a stable user idempotency key", async () => {
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
    await sendWelcomeEmail(user, "https://app.example.test");
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: config.EMAIL_FROM,
        to: [user.email],
        subject: `Welcome to ${EMAIL_BRAND}`,
        html: expect.stringContaining("Open workspace"),
        text: expect.stringMatching(/open workspace/i),
      }),
      { idempotencyKey: "welcome/user-1" },
    );
    const text = send.mock.calls[0]?.[0].text;
    expect(text).not.toContain("<html");
    expect(text).not.toContain("Or open this link in your browser:");
    expect(text).not.toContain(
      "https://app.example.test https://app.example.test",
    );
  });
  it("skips unset credentials, unset sender and placeholder key", async () => {
    config.RESEND_API_KEY = "";
    await sendWelcomeEmail(user, "https://app.example.test");
    config.RESEND_API_KEY = "re_xxx";
    await sendWelcomeEmail(user, "https://app.example.test");
    config.RESEND_API_KEY = "re_xxx_placeholder";
    await sendWelcomeEmail(user, "https://app.example.test");
    config.RESEND_API_KEY = "re_test";
    config.EMAIL_FROM = "";
    await sendWelcomeEmail(user, "https://app.example.test");
    expect(send).not.toHaveBeenCalled();
  });
  it("surfaces SDK error responses as failures for the auth hook to catch", async () => {
    send.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "bad sender" },
    });
    await expect(
      sendWelcomeEmail(user, "https://app.example.test"),
    ).rejects.toThrow("Email delivery failed: validation_error");
  });
});
