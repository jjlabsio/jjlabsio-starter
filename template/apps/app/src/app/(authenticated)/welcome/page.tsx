import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@repo/auth";
import {
  getSubscription,
  hasActiveTrial,
  TRIAL_DURATION_DAYS,
} from "@repo/billing";
import { Button } from "@repo/ui/components/button";

export default async function WelcomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const subscription = await getSubscription(session.user.id);
  if (!hasActiveTrial(subscription)) {
    redirect("/");
  }

  const daysRemaining = subscription?.trialEnd
    ? Math.ceil(
        (subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : TRIAL_DURATION_DAYS;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-3xl font-semibold">Welcome!</h1>
        <p className="text-muted-foreground mb-2 text-base">
          Your free trial has started.
        </p>
        <p className="text-muted-foreground mb-8 text-sm">
          You have {daysRemaining} days to explore all features.
        </p>
        <Button asChild size="lg">
          <Link href="/">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
