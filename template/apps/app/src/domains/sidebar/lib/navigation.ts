export type BreadcrumbEntry = { label: string; href?: string };
export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
export const projectsNavigation = {
  label: "Projects",
  href: "/resources/projects",
  breadcrumbs: [
    { label: "Projects", href: "/resources/projects" },
  ] satisfies BreadcrumbEntry[],
};
export function projectBreadcrumbs(
  details: BreadcrumbEntry[] = [],
): BreadcrumbEntry[] {
  return [...projectsNavigation.breadcrumbs, ...details].map(
    (entry, index, entries) =>
      index === entries.length - 1 ? { label: entry.label } : entry,
  );
}
