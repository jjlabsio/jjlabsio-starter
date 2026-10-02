"use client";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { authClient } from "@/lib/auth-client";
import { IconBrandGoogle } from "@tabler/icons-react";
import { signInAsDev } from "./sign-in-as-dev";
export function SignIn({ showDevLogin }: { showDevLogin: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <Button
        className="w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          try {
            const result = await authClient.signIn.social({
              provider: "google",
              callbackURL: "/rewards",
              errorCallbackURL: "/sign-in?error=access_denied",
            });
            if (result.error) {
              setError("Could not sign in. Try again.");
              setPending(false);
            }
          } catch {
            setError("Could not sign in. Try again.");
            setPending(false);
          }
        }}
      >
        <IconBrandGoogle className="size-4" />
        {pending ? "Signing in..." : "Continue with Google"}
      </Button>
      {showDevLogin && (
        <Button
          className="w-full"
          variant="secondary"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError("");
            try {
              const result = await signInAsDev();
              setError(result.error);
            } catch {
              setError("Could not sign in. Try again.");
            }
            setPending(false);
          }}
        >
          Continue with development account
        </Button>
      )}
      {error && (
        <p role="alert" className="type-ui-body text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
