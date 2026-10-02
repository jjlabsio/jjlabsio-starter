import type { ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { EMAIL_BRAND } from "../config";

/** Shared shell for every service email; templates supply only their content. */
export function EmailLayout({
  preview,
  children,
  brandName = EMAIL_BRAND,
}: {
  preview: string;
  children: ReactNode;
  brandName?: string;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          color: "#171717",
          fontFamily: 'Arial, "Helvetica Neue", sans-serif',
          margin: 0,
          WebkitTextSizeAdjust: "100%",
        }}
      >
        <Container
          style={{
            width: "100%",
            maxWidth: "560px",
            margin: "0 auto",
            padding: "48px 24px",
          }}
        >
          <Text
            style={{
              fontSize: "18px",
              lineHeight: "24px",
              fontWeight: 700,
              margin: "0 0 40px",
            }}
          >
            {brandName}
          </Text>
          {children}
          <Text
            style={{
              borderTop: "1px solid #e5e5e5",
              paddingTop: "24px",
              marginTop: "32px",
              fontSize: "12px",
              lineHeight: "18px",
              color: "#737373",
            }}
          >
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
