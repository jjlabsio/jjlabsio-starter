import { Button, Heading, Hr, Text } from "@react-email/components";
import type { EmailContent } from "../content";
import { EmailLayout } from "./layout";

export function CampaignEmail({
  content,
  brandName,
}: {
  content: EmailContent;
  brandName?: string;
}) {
  return (
    <EmailLayout
      preview={content.previewText || content.subject}
      brandName={brandName}
    >
      {content.blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <Heading
                key={index}
                as="h2"
                style={{
                  fontSize: "24px",
                  lineHeight: "32px",
                  fontWeight: 600,
                  margin: "0 0 20px",
                }}
              >
                {block.text}
              </Heading>
            );
          case "paragraph":
            return (
              <Text
                key={index}
                style={{
                  fontSize: "16px",
                  lineHeight: "26px",
                  color: "#525252",
                  margin: "0 0 24px",
                  whiteSpace: "pre-line",
                }}
              >
                {block.text}
              </Text>
            );
          case "bullets":
            return (
              <ul
                key={index}
                style={{
                  paddingLeft: "24px",
                  margin: "0 0 24px",
                  fontSize: "16px",
                  lineHeight: "26px",
                  color: "#525252",
                }}
              >
                {block.text
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, item) => (
                    <li key={item} style={{ marginBottom: "8px" }}>
                      {line.trim()}
                    </li>
                  ))}
              </ul>
            );
          case "button":
            return block.url ? (
              <div key={index} style={{ margin: "0 0 24px" }}>
                <Button
                  href={block.url}
                  style={{
                    backgroundColor: "#171717",
                    color: "#ffffff",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 600,
                  }}
                >
                  {block.text}
                </Button>
              </div>
            ) : null;
          case "divider":
            return (
              <Hr
                key={index}
                style={{ borderColor: "#e5e5e5", margin: "24px 0" }}
              />
            );
        }
      })}
    </EmailLayout>
  );
}
