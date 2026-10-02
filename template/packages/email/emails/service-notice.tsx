import { CampaignEmail } from "../src/templates/campaign";

export default function ServiceNoticePreview() {
  return (
    <CampaignEmail
      brandName="Acme"
      content={{
        subject: "An update for your workspace",
        previewText: "A sample service notice.",
        audiences: ["trial", "subscribed"],
        blocks: [
          { type: "heading", text: "An update for your workspace" },
          {
            type: "paragraph",
            text: "Here is a sample service notice. Replace this content with your own message.",
          },
          {
            type: "bullets",
            text: "A clear heading\nA concise message\nOne action when a next step is needed",
          },
          {
            type: "button",
            text: "Open workspace",
            url: "https://app.example.com",
          },
          { type: "divider" },
          { type: "paragraph", text: "Thank you for using Acme." },
        ],
      }}
    />
  );
}
