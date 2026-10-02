import "server-only";
import { z } from "zod";
import { getEmailSender, getResendClient } from "./client";
export { emailSendingConfigured, getEmailSender } from "./client";

/** Each recipient gets a separate message; no shared To/CC list. */
export async function sendEmailBatch(input: {
  recipients: string[];
  subject: string;
  html: string;
  text: string;
  from: string;
  key: string;
}) {
  const sender = getEmailSender(input.from);
  const recipients = z
    .array(z.string().email())
    .min(1)
    .max(100)
    .parse(input.recipients);
  const response = await getResendClient().batch.send(
    recipients.map((to) => ({
      to,
      from: sender,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })),
    { idempotencyKey: input.key },
  );
  if (response.error || response.data?.data.length !== recipients.length)
    throw new Error(
      "Email batch was not confirmed. Retry the existing batch; do not create a duplicate campaign.",
    );
  return response.data.data.map((item) => item.id);
}
