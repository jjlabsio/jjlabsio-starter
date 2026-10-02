import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/toast";
import { Providers } from "@/components/providers";
import { pretendard } from "@/styles/font";
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={pretendard.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
