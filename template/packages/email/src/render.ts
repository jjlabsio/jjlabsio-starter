import type { ReactElement } from "react";
import { render } from "@react-email/components";

/** Shared renderer for previews and delivery, including a plain-text alternative. */
export async function renderEmail(email: ReactElement) {
  const [html, text] = await Promise.all([
    render(email),
    render(email, {
      plainText: true,
      htmlToTextOptions: {
        selectors: [
          { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
        ],
      },
    }),
  ]);
  return { html, text };
}
