import { createElement } from "react";
import { sendEmail, emailSendingConfigured } from "./index";
import { EMAIL_BRAND } from "./config";
import { WelcomeEmail } from "./templates/welcome";

export async function sendWelcomeEmail(
  user: { id: string; name: string; email: string },
  appUrl: string,
) {
  // Optional in a newly installed template; never send using placeholder settings.
  if (!emailSendingConfigured()) return;
  await sendEmail({
    to: user.email,
    subject: `Welcome to ${EMAIL_BRAND}`,
    react: createElement(WelcomeEmail, { name: user.name, appUrl }),
    idempotencyKey: `welcome/${user.id}`,
  });
}
