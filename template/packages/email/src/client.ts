import "server-only";
import { Resend } from "resend";
import { env } from "./keys";

/** Missing/placeholder credentials keep a newly installed template offline. */
export function emailSendingConfigured(from = env.EMAIL_FROM) {
  const key = env.RESEND_API_KEY?.trim();
  return !!key && !key.startsWith("re_xxx") && !!from?.trim();
}

export function getEmailSender(from = env.EMAIL_FROM) {
  if (!emailSendingConfigured(from))
    throw new Error(
      "Email sending is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  return from!.trim();
}

export function getResendClient() {
  const key = env.RESEND_API_KEY?.trim();
  if (!key || key.startsWith("re_xxx"))
    throw new Error("Email sending is not configured. Set RESEND_API_KEY.");
  return new Resend(key);
}
