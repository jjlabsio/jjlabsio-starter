import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingPageHeading } from "@/components/marketing-page-heading";
import { FaqSection } from "@/components/faq-section";
import { buttonVariants } from "@repo/ui/components/button";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Rewards Program - Acme",
  description: "Share your real experience with Acme and submit a public post for review.",
  robots: { index: false, follow: true },
};

const submissionUrl = `${env.NEXT_PUBLIC_APP_URL}/rewards`;

const steps = [
  { title: "Share your experience", description: "Publish an original post or video on X, LinkedIn, Instagram, TikTok, or YouTube. Show how you use Acme, what you learned, and what could be better." },
  { title: "Submit your post", description: "Sign in to your account, submit the public post URL, and confirm the participation guidelines. Permission to reuse your post for marketing is optional." },
  { title: "Get reviewed", description: "We check your post against the guidelines below. Follow the review status in your account. Reward details will be announced before the program launches." },
];

const rules = [
  { title: "Real experience", description: "Use your own words and show actual product usage. Honest criticism is welcome. Approval never depends on a positive opinion, follower count, likes, or sales." },
  { title: "Public and original", description: "Your post must identify Acme and be publicly accessible during review. Private messages, duplicate posts, copied content, and artificial engagement do not qualify. Public blogs are also welcome." },
  { title: "Clear disclosure", description: "Clearly explain in the post that you may receive a reward for participating. Put the disclosure where people will notice it, and follow your platform’s advertising rules." },
  { title: "One approval per account", description: "Each account can have one approved submission, regardless of how many platforms the same content appears on. Specific reward details will be announced before launch." },
];

const faqs = [
  { question: "Is this an affiliate or referral program?", answer: "No. This program rewards an eligible public post after review. You do not need to invite anyone, generate sales, or use a tracked affiliate link." },
  { question: "Do I need a large audience?", answer: "No. There is no minimum follower count or engagement target. We check originality, real usage, public access, and disclosure—not popularity." },
  { question: "Does my post have to be positive?", answer: "No. Share your honest experience, including anything that could improve. The reward is for meeting the participation guidelines, not for praise." },
  { question: "How is the reward applied?", answer: "Reward details will be announced before the program launches. This template records submissions and review decisions only. Approval does not automatically grant access, change your subscription, or issue payment." },
  { question: "How long does review take?", answer: "The example policy targets five business days. If information is missing, we will ask you to update the submission. Sending a post does not guarantee approval." },
  { question: "How do I disclose the reward?", answer: "Use a clear statement such as: “I’m participating in Acme’s Rewards Program and may receive a reward for this post.” Include it prominently in the post or video, not only in your profile." },
];

export default function RewardsPage() {
  return <><Header />
    <main>
      <MarketingPageHeading title="Rewards Program" description="Share your honest experience with Acme and submit your public post for review." />
      <div className="mx-auto max-w-7xl px-6">
        <div className="pb-12 text-center">
          <a href={submissionUrl} className={buttonVariants()}>Submit your post</a>
          <p className="mt-4 text-sm text-muted-foreground">Template preview · Reward details are not yet set · Sign in to submit</p>
        </div>
        <section className="py-12 md:py-20" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">How it works</h2>
          <ol className="grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
            {steps.map((step, index) => <li key={step.title} className="px-6 py-8 max-md:not-last:border-b max-md:border-border">
              <p className="mb-4 text-sm text-muted-foreground">Step {index + 1}</p>
              <h3 className="text-xl font-medium tracking-tight">{step.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{step.description}</p>
            </li>)}
          </ol>
        </section>
        <section className="py-12 md:py-20" aria-labelledby="guidelines">
          <h2 id="guidelines" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">What makes a post eligible</h2>
          <div className="divide-y divide-border border-y border-border">
            {rules.map((rule) => <div key={rule.title} className="grid gap-3 py-8 md:grid-cols-[1fr_2fr] md:gap-12">
              <h3 className="text-xl font-medium">{rule.title}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{rule.description}</p>
            </div>)}
          </div>
        </section>
      </div>
    </main>
    <FaqSection items={faqs} />
    <section className="border-t border-border px-6 py-20 text-center md:py-24">
      <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">Ready to share your story?</h2>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">Submit your post in your account and follow its review status.</p>
      <a href={submissionUrl} className={buttonVariants({ className: "mt-8" })}>Submit your post</a>
    </section>
    <Footer />
  </>;
}
