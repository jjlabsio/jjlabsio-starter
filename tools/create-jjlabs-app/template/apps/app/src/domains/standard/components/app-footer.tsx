import Link from "next/link";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Guidelines", href: "/guidelines" },
] as const;

export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="px-8 py-8 text-center">
        <p className="text-muted-foreground mb-2 text-xs">
          Acme Inc. - Building the future of SaaS
        </p>
        <p className="text-muted-foreground mb-3 text-xs">
          &copy; {new Date().getFullYear()} Acme Inc. All rights reserved.
        </p>
        <p className="text-muted-foreground text-xs">
          {footerLinks.map((link, index) => (
            <span key={link.href}>
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
              )}
              <Link
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
