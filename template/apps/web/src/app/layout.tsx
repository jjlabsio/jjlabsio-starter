import type { Metadata } from "next";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/toast";
import { Providers } from "@/components/providers";
import { pretendard } from "@/styles/font";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:4000"),
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
    <html lang="en" className={pretendard.variable} suppressHydrationWarning>
      <body className="bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
