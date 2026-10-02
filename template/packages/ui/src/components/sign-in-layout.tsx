import type { ReactNode } from "react";
export function SignInLayout({ title = "Sign in", description, webUrl, children }: { title?: string; description?: string; webUrl: string; children: ReactNode }) {
  const base = webUrl.replace(/\/$/, "");
  return <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
    <section className="w-full max-w-sm space-y-8">
      <div className="text-center"><p className="text-base font-semibold tracking-tight">Acme</p><h1 className="mt-8 text-3xl font-medium tracking-tight">{title}</h1>{description && <p className="mt-3 type-ui-body text-muted-foreground">{description}</p>}</div>
      <div className="space-y-3 [&_[data-slot=button]]:h-11">{children}</div>
      <p className="text-center type-ui-caption leading-5 text-muted-foreground"><span className="block">By continuing, you agree to our</span>
        <span className="block">
        <a href={base + "/terms-of-service"} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Terms of Service</a>{" "}and{" "}
        <a href={base + "/privacy"} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</a>.</span>
      </p>
    </section>
  </main>;
}
