import { describe, expect, it } from "vitest";
import {
  getFilesToRemove,
  getSelectedLayoutDir,
} from "../../src/config/layout-files.js";
import {
  SIDEBAR_GROUP_DIR,
  STANDARD_GROUP_DIR,
  COMPONENTS_DIR,
} from "../../src/config/constants.js";

describe("getFilesToRemove", () => {
  it("returns standard files when sidebar is selected", () => {
    const result = getFilesToRemove("sidebar");

    expect(result.routeGroupDir).toBe(STANDARD_GROUP_DIR);
    expect(result.components).toContain(`${COMPONENTS_DIR}/app-header.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/app-footer.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/mobile-nav.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/user-menu.tsx`);
    expect(result.components).toHaveLength(4);
  });

  it("returns sidebar files when standard is selected", () => {
    const result = getFilesToRemove("standard");

    expect(result.routeGroupDir).toBe(SIDEBAR_GROUP_DIR);
    expect(result.components).toContain(`${COMPONENTS_DIR}/app-sidebar.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/nav-main.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/nav-secondary.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/nav-user.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/nav-documents.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/site-header.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/page-container.tsx`);
    expect(result.components).toContain(`${COMPONENTS_DIR}/section-cards.tsx`);
    expect(result.components).toContain(
      `${COMPONENTS_DIR}/chart-area-interactive.tsx`,
    );
    expect(result.components).toHaveLength(9);
  });

  it("does not include shared files like providers.tsx or theme-toggle.tsx", () => {
    const sidebarResult = getFilesToRemove("sidebar");
    const standardResult = getFilesToRemove("standard");
    const allComponents = [
      ...sidebarResult.components,
      ...standardResult.components,
    ];

    expect(allComponents).not.toContain(`${COMPONENTS_DIR}/providers.tsx`);
    expect(allComponents).not.toContain(`${COMPONENTS_DIR}/theme-toggle.tsx`);
  });
});

describe("getSelectedLayoutDir", () => {
  it("returns sidebar group dir when sidebar is selected", () => {
    expect(getSelectedLayoutDir("sidebar")).toBe(SIDEBAR_GROUP_DIR);
  });

  it("returns standard group dir when standard is selected", () => {
    expect(getSelectedLayoutDir("standard")).toBe(STANDARD_GROUP_DIR);
  });
});
