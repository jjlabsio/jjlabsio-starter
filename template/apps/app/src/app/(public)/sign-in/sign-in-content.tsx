"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@repo/auth/client";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import { SignInLayout } from "@repo/ui/components/sign-in-layout";
import { resolveCallbackUrl } from "@/lib/resolve-callback-url";
import { signInAsDev } from "./sign-in-as-dev";

export function SignInContent({
  showDevLogin,
  webUrl,
}: {
  showDevLogin: boolean;
  webUrl: string;
}) {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const next = resolveCallbackUrl(searchParams.get("next"));

  const handleSignIn = async () => {
    setError(null);
    setIsPending(true);
    await signIn.social(
      { provider: "google", callbackURL: next },
      {
        onError(ctx) {
          setError(ctx.error.message);
          setIsPending(false);
        },
      },
    );
  };

  const handleDevSignIn = async () => {
    setError(null);
    setIsPending(true);
    const result = await signInAsDev(next);
    setError(result.error);
    setIsPending(false);
  };

  return (
    <SignInLayout webUrl={webUrl}>
      {error && <p className="text-destructive text-center text-sm">{error}</p>}
      <Button
        className="w-full"
        variant="default"
        disabled={isPending}
        onClick={handleSignIn}
      >
        <IconBrandGoogle className="size-4" />
        {isPending ? "Signing in..." : "Continue with Google"}
      </Button>
      {showDevLogin && (
        <Button
          className="w-full"
          variant="secondary"
          disabled={isPending}
          onClick={handleDevSignIn}
        >
          Continue with development account
        </Button>
      )}
    </SignInLayout>
  );
}
