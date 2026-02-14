const FAQS = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate any billing differences.",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      "After your 14-day free trial, you can choose to subscribe to Pro or continue with the Free plan. No credit card required to start.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes, annual plans come with a 20% discount. Contact our sales team for more details on annual and volume pricing.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.",
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
