import { SignInLayout } from "@repo/ui/components/sign-in-layout";
import { localDevAuthEnabled } from "@/lib/auth";
import { SignIn } from "./sign-in";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <SignInLayout
      webUrl={process.env.NEXT_PUBLIC_WEB_URL ?? ""}
    >
      {error && (
        <p role="alert" className="type-ui-body text-destructive">
          This account could not sign in. Use the designated Google account.
        </p>
      )}
      <SignIn showDevLogin={localDevAuthEnabled} />
    </SignInLayout>
  );
}
