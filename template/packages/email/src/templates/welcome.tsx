import { Button, Heading, Text } from "@react-email/components";
import { EMAIL_BRAND } from "../config";
import { EmailLayout } from "./layout";

export function WelcomeEmail({
  name,
  appUrl,
  brandName = EMAIL_BRAND,
}: {
  name: string;
  appUrl: string;
  brandName?: string;
}) {
  return (
    <EmailLayout
      preview={`Welcome to ${brandName}. Your account is ready.`}
      brandName={brandName}
    >
      <Heading
        style={{
          fontSize: "28px",
          lineHeight: "36px",
          fontWeight: 600,
          letterSpacing: "-0.5px",
          margin: "0 0 24px",
        }}
      >
        Welcome to {brandName}
      </Heading>
      <Text
        style={{ fontSize: "16px", lineHeight: "26px", margin: "0 0 16px" }}
      >
        Hi {name.trim() || "there"},
      </Text>
      <Text
        style={{
          fontSize: "16px",
          lineHeight: "26px",
          color: "#525252",
          margin: "0 0 24px",
        }}
      >
        Thanks for signing up. Your account is ready. Open your workspace to get
        started.
      </Text>
      <Button
        href={appUrl}
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
        Open workspace
      </Button>
    </EmailLayout>
  );
}
