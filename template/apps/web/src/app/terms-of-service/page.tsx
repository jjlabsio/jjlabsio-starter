import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = { title: "Terms of Service - Acme", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-16 md:py-24">
        <h1 className="text-4xl font-medium tracking-tight">Terms of Service</h1>
        <p className="mt-6 type-ui-body text-muted-foreground">Placeholder only — replace with your service&apos;s terms before publishing.</p>
      </main>
      <Footer />
    </>
  );
}
