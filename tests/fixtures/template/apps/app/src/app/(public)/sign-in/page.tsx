"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@repo/auth/client";
import { resolveCallbackUrl } from "@/lib/resolve-callback-url";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const next = resolveCallbackUrl(searchParams.get("next"));

  const handleSignIn = async () => {
    setIsPending(true);
    await signIn.social(
      { provider: "google", callbackURL: next },
      {
        onError() {
          setIsPending(false);
        },
      },
    );
  };

  return (
    <button onClick={handleSignIn}>{isPending ? "..." : "Sign in"}</button>
  );
}
