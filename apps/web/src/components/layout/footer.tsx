import Link from "next/link";

const LINK_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Documentation", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Twitter", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Discord", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Acme
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Build better products, faster than ever.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-medium">{group.title}</h3>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-border/40 pt-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Acme Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
