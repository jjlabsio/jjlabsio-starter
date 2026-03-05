import "server-only";
import { Resend } from "resend";
import type React from "react";
import { env } from "./keys";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  return resend.emails.send({
    from: from ?? "{{PROJECT_NAME}} <noreply@yourdomain.com>",
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  });
}

export { env } from "./keys";
