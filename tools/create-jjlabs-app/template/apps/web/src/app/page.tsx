import { Header } from "@/components/layout/header";
import { Hero } from "./_components/hero";
import { SocialProof } from "./_components/social-proof";
import { Testimonials } from "./_components/testimonials";
import { FeatureIntro } from "./_components/feature-intro";
import { FeatureBlock } from "./_components/feature-block";
import { Differentiator } from "./_components/differentiator";
import { DarkFeatures } from "./_components/dark-features";
import { CtaSection } from "./_components/cta-section";
import { Footer } from "@/components/layout/footer";

export default function Page() {
  return (
    <div className="min-h-svh">
      <Header />
      <Hero />
      <SocialProof />
      <Testimonials />
      <FeatureIntro />
      <FeatureBlock
        title="Streamline your workflow"
        description="Automate repetitive tasks and let your team focus on what they do best. Our intelligent pipeline builder connects your tools and creates seamless workflows without code."
        mockupLabel="Workflow Builder Preview"
      />
      <FeatureBlock
        title="Collaborate in real-time"
        description="Work together across time zones with live cursors, inline comments, and instant syncing. No more version conflicts or lost updates."
        mockupLabel="Collaboration Preview"
        reversed
      />
      <Differentiator />
      <DarkFeatures />
      <CtaSection />
      <Footer />
    </div>
  );
}
