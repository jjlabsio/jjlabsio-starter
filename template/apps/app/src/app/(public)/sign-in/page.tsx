"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@repo/auth/client";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { resolveCallbackUrl } from "@/lib/resolve-callback-url";

function SignInContent() {
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

  return (
    <div className="flex min-h-svh items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Sign in with your Google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive mb-4 text-center text-sm">{error}</p>
          )}
          <Button
            className="w-full"
            variant="outline"
            disabled={isPending}
            onClick={handleSignIn}
          >
            <IconBrandGoogle className="size-4" />
            {isPending ? "Signing in..." : "Continue with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-svh items-center justify-center" />}
    >
      <SignInContent />
    </Suspense>
  );
}
