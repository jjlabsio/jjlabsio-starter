import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingPageHeading } from "@/components/marketing-page-heading";
import { PricingToggle } from "./_components/pricing-toggle";
import { FaqSection } from "@/components/faq-section";
import { pricingFaqItems } from "./_components/faq-items";
import { PricingCta } from "./_components/pricing-cta";

export const metadata: Metadata = {
  title: "Pricing - Acme",
  description: "Simple, transparent pricing. Start free and scale as you grow.",
};

export default function PricingPage() {
  return (
    <div className="min-h-svh">
      <Header />
      <MarketingPageHeading
        title="Pricing"
        description="Start free and scale as you grow. No hidden fees, no surprises."
      />
      <PricingToggle />
      <FaqSection items={pricingFaqItems} />
      <PricingCta />
      <Footer />
    </div>
  );
}
