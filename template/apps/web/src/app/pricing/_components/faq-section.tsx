const FAQS = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate any billing differences.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes, annual plans come with a 17% discount compared to monthly billing.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and wire transfers for large accounts.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel at any time from your account settings. Your access continues until the end of the current billing period.",
  },
] as const;

export function FaqSection() {
  return (
    <section className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-light tracking-tight md:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-12 flex flex-col gap-8">
          {FAQS.map((faq) => (
            <div
              key={faq.question}
              className="border-b border-border/40 pb-8 last:border-0"
            >
              <h3 className="text-base font-medium">{faq.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
