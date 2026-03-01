import { describe, expect, it } from "vitest";
import {
  getDirsToRemove,
  getSelectedLayoutDir,
} from "../../src/config/layout-files.js";
import {
  SIDEBAR_GROUP_DIR,
  STANDARD_GROUP_DIR,
  SIDEBAR_DOMAIN_DIR,
  STANDARD_DOMAIN_DIR,
} from "../../src/config/constants.js";

describe("getDirsToRemove", () => {
  it("returns standard dirs when sidebar is selected", () => {
    const result = getDirsToRemove("sidebar");

    expect(result.routeGroupDir).toBe(STANDARD_GROUP_DIR);
    expect(result.domainDir).toBe(STANDARD_DOMAIN_DIR);
  });

  it("returns sidebar dirs when standard is selected", () => {
    const result = getDirsToRemove("standard");

    expect(result.routeGroupDir).toBe(SIDEBAR_GROUP_DIR);
    expect(result.domainDir).toBe(SIDEBAR_DOMAIN_DIR);
  });

  it("never returns the selected layout's own dirs", () => {
    const sidebarResult = getDirsToRemove("sidebar");
    const standardResult = getDirsToRemove("standard");

    expect(sidebarResult.routeGroupDir).not.toBe(SIDEBAR_GROUP_DIR);
    expect(sidebarResult.domainDir).not.toBe(SIDEBAR_DOMAIN_DIR);
    expect(standardResult.routeGroupDir).not.toBe(STANDARD_GROUP_DIR);
    expect(standardResult.domainDir).not.toBe(STANDARD_DOMAIN_DIR);
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
