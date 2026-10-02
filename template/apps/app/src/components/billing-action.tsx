"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/components/toast";

// App-level composition: billing transport stays outside the shared UI package.
export function BillingAction({
  endpoint,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  endpoint: string;
}) {
  const [pending, setPending] = useState(false);
  async function openBilling() {
    setPending(true);
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string")
        throw new Error(
          result.error || "Billing is unavailable. Please try again.",
        );
      window.location.assign(result.url);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not open billing",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      setPending(false);
    }
  }
  return (
    <Button
      {...props}
      disabled={props.disabled || pending}
      onClick={openBilling}
      aria-busy={pending}
    >
      {pending ? "Opening…" : children}
    </Button>
  );
}
