import "server-only";
import type React from "react";
import { z } from "zod";
import { getEmailSender, getResendClient } from "./client";
import { renderEmail } from "./render";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  idempotencyKey?: string;
}

/** Server-only transactional email; broadcasts must use separate-recipient batches. */
export async function sendEmail({
  to,
  subject,
  react,
  from,
  idempotencyKey,
}: SendEmailOptions) {
  const sender = getEmailSender(from);
  const recipients = z
    .array(z.string().email())
    .min(1)
    .parse(Array.isArray(to) ? to : [to]);
  const validSubject = z
    .string()
    .trim()
    .min(1)
    .refine((value) => !/[\r\n]/.test(value))
    .parse(subject);
  const { html, text } = await renderEmail(react);
  const result = await getResendClient().emails.send(
    {
      from: sender,
      to: recipients,
      subject: validSubject,
      html,
      text,
    },
    { idempotencyKey },
  );
  if (result.error)
    throw new Error(`Email delivery failed: ${result.error.name}`);
  if (!result.data?.id) throw new Error("Email delivery was not confirmed.");
  return result.data;
}

export { env } from "./keys";
export { emailSendingConfigured } from "./client";
export { sendEmailBatch } from "./batch";
export { renderEmail } from "./render";
