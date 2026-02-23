"use client";

import { useState } from "react";
import { signIn } from "@repo/auth/client";

export default function SignInPage() {
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async () => {
    setIsPending(true);
    await signIn.social(
      { provider: "google", callbackURL: "/dashboard" },
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
