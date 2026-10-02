import { Suspense } from "react";
import { localDevAuthEnabled } from "@repo/auth";
import { SignInContent } from "./sign-in-content";

export default function SignInPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-svh items-center justify-center" />}
    >
      <SignInContent
        showDevLogin={localDevAuthEnabled}
        webUrl={process.env.NEXT_PUBLIC_WEB_URL ?? ""}
      />
    </Suspense>
  );
}
