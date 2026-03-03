"use client";

import { useState } from "react";

import { Button } from "@repo/ui/components/button";

export default function HomePage() {
  const [isFlexLoading, setIsFlexLoading] = useState(false);
  const [isInlineLoading, setIsInlineLoading] = useState(false);

  const handleFlexClick = () => {
    setIsFlexLoading(true);
    setTimeout(() => setIsFlexLoading(false), 2000);
  };

  const handleInlineClick = () => {
    setIsInlineLoading(true);
    setTimeout(() => setIsInlineLoading(false), 2000);
  };

  return (
    <>
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        Welcome
      </p>
      <h1 className="mb-14 max-w-lg text-center text-4xl leading-snug font-normal">
        Build your next SaaS product faster than ever.
      </h1>

      <div className="flex w-full max-w-md gap-3">
        <Button
          isLoading={isFlexLoading}
          onClick={handleFlexClick}
          className="flex-1 px-8 py-5 text-base font-semibold uppercase tracking-wide"
        >
          Get Started
        </Button>
        <Button
          variant="secondary"
          className="flex-1 px-8 py-5 text-base font-semibold uppercase tracking-wide"
        >
          Learn More
        </Button>
      </div>

      <div className="mt-8">
        <Button
          isLoading={isInlineLoading}
          onClick={handleInlineClick}
          className="px-8 py-5 text-base font-semibold uppercase tracking-wide"
        >
          Submit Without Flex
        </Button>
      </div>

      <div className="text-muted-foreground mt-6 flex items-center gap-3 text-xs">
        <span>No credit card required</span>
        <span aria-hidden="true">&middot;</span>
        <span>Free tier available</span>
        <span aria-hidden="true">&middot;</span>
        <span>Cancel anytime</span>
      </div>
    </>
  );
}
