"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@repo/ui/components/accordion";
import { CaretIcon } from "@repo/ui/components/caret-icon";
import type { ComponentProps } from "react";

// 랜딩 전용 조합: 공통 아코디언의 동작을 유지하고 표시 아이콘만 교체.
function LandingAccordionTrigger({ children, ...props }: ComponentProps<typeof AccordionTrigger>) {
  return (
    <AccordionTrigger {...props} className="gap-4 py-4 [&]:text-base [&]:leading-6 [&>[data-slot=caret-icon]]:hidden">
      {children}
      <CaretIcon variant="chevron" className="ml-auto size-4 text-muted-foreground transition-transform group-aria-expanded/accordion-trigger:rotate-180" />
    </AccordionTrigger>
  );
}

const defaultItems = [
  {
    question: "How do I get started?",
    answer: "Select Start for free to sign in and explore your workspace.",
  },
  {
    question: "Can I use this with my team?",
    answer:
      "The workspace brings projects, workflows, and reporting together for your team.",
  },
  {
    question: "Where can I compare plans?",
    answer:
      "Visit Pricing to compare the available plans and their included features.",
  },
  {
    question: "How can I contact support?",
    answer: "Use Contact us in the footer to reach our support team by email.",
  },
];

export function FaqSection({
  items = defaultItems,
}: {
  items?: readonly { question: string; answer: string }[];
}) {
  return (
    <section aria-label="FAQ" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <h2 className="mb-10 text-center text-3xl font-medium tracking-tight md:text-4xl">
        FAQ
      </h2>
      <Accordion className="mx-auto max-w-3xl">
        {items.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <LandingAccordionTrigger>{item.question}</LandingAccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
