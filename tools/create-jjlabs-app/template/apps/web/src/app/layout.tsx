import type { Metadata } from "next";
import "@repo/ui/globals.css";
import "@/styles/theme.css";
import { Providers } from "@/components/providers";
import { pretendard } from "@/styles/font";

export const metadata: Metadata = {
  title: "Acme - Build Better Products Faster",
  description:
    "Acme is the modern platform that helps teams ship products 10x faster with AI-powered workflows, seamless collaboration, and powerful analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pretendard.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
