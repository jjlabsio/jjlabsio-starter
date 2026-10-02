import { describe, expect, it } from "vitest";
import { projectBreadcrumbs, projectsNavigation, isNavigationActive } from "./navigation";
describe("navigation hierarchy", () => {
  it("starts at the actual menu and excludes sidebar categories", () => {
    const path = projectBreadcrumbs([
      { label: "Atlas", href: "/resources/projects/atlas" },
      { label: "Pages", href: "/resources/projects/atlas/pages" },
      { label: "Getting started", href: "/not-a-current-link" },
    ]);
    expect(path.map((entry) => entry.label)).toEqual(["Projects", "Atlas", "Pages", "Getting started"]);
    expect(path[0]?.href).toBe(projectsNavigation.href);
    expect(path[3]?.href).toBeUndefined();
    expect(projectBreadcrumbs()).toEqual([{ label: "Projects" }]);
  });
  it("keeps Projects active at every child depth", () => {
    expect(isNavigationActive("/resources/projects/atlas/pages/getting-started", projectsNavigation.href)).toBe(true);
    expect(isNavigationActive("/resources/projects-other", projectsNavigation.href)).toBe(false);
    expect(isNavigationActive(projectsNavigation.href, "/")).toBe(false);
  });
});
