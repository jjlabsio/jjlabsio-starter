import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingHero } from "./_components/pricing-hero";
import { PricingToggle } from "./_components/pricing-toggle";
import { FaqSection } from "./_components/faq-section";
import { PricingCta } from "./_components/pricing-cta";

export const metadata: Metadata = {
  title: "Pricing - Acme",
  description: "Simple, transparent pricing. Start free and scale as you grow.",
};

export default function PricingPage() {
  return (
    <div className="min-h-svh">
      <Header />
      <PricingHero />
      <PricingToggle />
      <FaqSection />
      <PricingCta />
      <Footer />
    </div>
  );
}
